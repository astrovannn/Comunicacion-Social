/**
 * Capa única de comunicación con el backend.
 * Ningún componente llama a fetch directamente.
 */
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `Error ${status}`);
    this.status = status;
    this.body = body;
  }
}

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

export const api = {
  getArtworks: () => request('/artworks'),
  getProgress: () => request('/progress'),
  visitArtwork: (slug) => request(`/visits/${encodeURIComponent(slug)}`, { method: 'POST' }),
  getSection: (slug) => request(`/site/${encodeURIComponent(slug)}`),
};
