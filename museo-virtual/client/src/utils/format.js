const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** 1 → "I", 2 → "II"… (cae al número normal si pasa de 12). */
export const roman = (n) => ROMAN[n - 1] ?? String(n);

/** Agrupa las obras por sala y las ordena. Devuelve [{ id, name, artworks }]. */
export function groupByRoom(artworks) {
  const map = new Map();
  for (const art of artworks) {
    if (!map.has(art.room)) map.set(art.room, { id: art.room, name: art.roomName, artworks: [] });
    map.get(art.room).artworks.push(art);
  }
  return [...map.values()]
    .sort((a, b) => a.id - b.id)
    .map((room) => ({ ...room, artworks: room.artworks.sort((a, b) => a.order - b.order) }));
}

/** Respeta la preferencia del sistema de reducir animaciones. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Subtítulo de una obra: "autor · fecha" con lo que exista; si no hay nada, el nombre de la sala. */
export const caption = (art) => [art.author, art.date].filter(Boolean).join(' · ') || art.roomName || '';
