/**
 * Capa única de comunicación con los datos.
 * Ningún componente llama a fetch directamente.
 *
 * Dos modos, elegidos al compilar con la variable VITE_STATIC:
 *  - normal (por defecto): habla con el servidor Express y MongoDB. El desbloqueo lo valida el servidor.
 *  - estático (VITE_STATIC=true, p. ej. en Netlify): las obras y textos vienen incluidos en el código
 *    y el progreso se guarda en localStorage. No hay servidor, así que el desbloqueo NO es a prueba
 *    de manipulación: alguien con conocimientos técnicos podría saltarse el recorrido.
 */
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `Error ${status}`);
    this.status = status;
    this.body = body;
  }
}

const STATIC = import.meta.env.VITE_STATIC === 'true';

// ───────────── Modo servidor ─────────────
async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok) throw new ApiError(res.status, body);
  return body;
}

const serverApi = {
  getArtworks: () => request('/artworks'),
  getProgress: () => request('/progress'),
  visitArtwork: (slug) => request(`/visits/${encodeURIComponent(slug)}`, { method: 'POST' }),
  getSection: (slug) => request(`/site/${encodeURIComponent(slug)}`),
};

// ───────────── Modo estático ─────────────
const STORAGE_KEY = 'museo.visited.v1'; // el mismo que usa useProgress como caché

function readStored() {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(list) ? list.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function writeStored(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // almacenamiento no disponible: el progreso no se conservará al recargar
  }
}

const memory = new Set(); // respaldo si localStorage no está disponible

function staticProgress(artworks) {
  const known = new Set(artworks.map((a) => a.slug));
  const visited = [...new Set([...readStored(), ...memory])].filter((s) => known.has(s));
  const visitedSet = new Set(visited);
  const mandatory = artworks.filter((a) => a.mandatory);
  const requiredDone = mandatory.filter((a) => visitedSet.has(a.slug)).length;
  return {
    visited,
    requiredDone,
    requiredTotal: mandatory.length,
    completed: mandatory.length > 0 && requiredDone === mandatory.length,
  };
}

const staticApi = {
  async getArtworks() {
    const { artworks } = await import('../data/content.js');
    return artworks;
  },
  async getProgress() {
    const { artworks } = await import('../data/content.js');
    return staticProgress(artworks);
  },
  async visitArtwork(slug) {
    const { artworks } = await import('../data/content.js');
    if (!artworks.some((a) => a.slug === slug)) throw new ApiError(404, { error: 'artwork_not_found' });
    memory.add(slug);
    writeStored([...new Set([...readStored(), slug])]);
    return staticProgress(artworks);
  },
  async getSection(slug) {
    const { artworks, sections } = await import('../data/content.js');
    if (!staticProgress(artworks).completed) {
      throw new ApiError(403, { error: 'locked', message: 'Completa el recorrido del museo para acceder a esta sección.' });
    }
    const section = sections.find((s) => s.slug === slug);
    if (!section) throw new ApiError(404, { error: 'section_not_found' });
    return section;
  },
};

export const api = STATIC ? staticApi : serverApi;
