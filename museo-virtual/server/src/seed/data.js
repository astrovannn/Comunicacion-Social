/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CONTENIDO PROVISIONAL
 *  Todo lo de este archivo es de relleno. Reemplázalo con tus obras reales
 *  (título, autor, fecha, técnica, dimensiones, historia e imagen) y luego
 *  ejecuta `npm run seed` en /server para actualizar la base de datos.
 *
 *  - slug:      identificador único en minúsculas y con guiones (no lo cambies
 *               después de publicar o se perderá el progreso de esa obra).
 *  - imageUrl:  ruta de la imagen (ej. /art/mi-foto.jpg dentro de client/public/art).
 *  - aspect:    ancho/alto del marco (0.8 vertical, 1 cuadrado, 1.5 horizontal).
 *  - room:      número de sala; roomName: nombre de la sala.
 *  - mandatory: false si la obra no debe ser obligatoria para el recorrido.
 *  - extra:     datos adicionales opcionales [{ label, value }].
 * ─────────────────────────────────────────────────────────────────────────
 */

const PROVISIONAL_TEXT =
  '[Texto provisional] Aquí irá la historia de la obra: cómo nació, qué la inspiró y qué quiso expresar su autor. ' +
  'Puedes escribir varios párrafos; el modal se desplaza si el texto es largo.';

const base = (n, rest) => ({
  slug: `obra-${n}`,
  title: `Obra ${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n - 1]}`,
  author: 'Por definir',
  date: 'Por definir',
  technique: 'Por definir',
  dimensions: 'Por definir',
  description: PROVISIONAL_TEXT,
  imageUrl: `/art/obra-${n}.jpg`,
  alt: 'Composición abstracta provisional',
  order: 0,
  mandatory: true,
  extra: [{ label: 'Colección', value: 'Por definir' }],
  ...rest,
});

// Distribución del museo: 4 salas con 4 · 2 · 2 · 2 obras (10 en total).
export const artworks = [
  // Sala I · Origen — 4 obras
  base(1, { room: 1, roomName: 'Origen', order: 1, aspect: 0.8 }),
  base(2, { room: 1, roomName: 'Origen', order: 2, aspect: 1.25 }),
  base(3, { room: 1, roomName: 'Origen', order: 3, aspect: 1 }),
  base(4, { room: 1, roomName: 'Origen', order: 4, aspect: 0.75 }),
  // Sala II · Materia — 2 obras
  base(5, { room: 2, roomName: 'Materia', order: 1, aspect: 1.5 }),
  base(6, { room: 2, roomName: 'Materia', order: 2, aspect: 0.8 }),
  // Sala III · Luz — 2 obras
  base(7, { room: 3, roomName: 'Luz', order: 1, aspect: 1.2 }),
  base(8, { room: 3, roomName: 'Luz', order: 2, aspect: 1 }),
  // Sala IV · Eco — 2 obras
  base(9, { room: 4, roomName: 'Eco', order: 1, aspect: 1.5 }),
  base(10, { room: 4, roomName: 'Eco', order: 2, aspect: 0.8 }),
];

export const sections = [
  {
    slug: 'inicio',
    order: 1,
    title: 'Bienvenido al otro lado',
    subtitle: '[Texto provisional] Has completado el recorrido: ahora puedes explorar el resto del sitio.',
    paragraphs: [
      '[Texto provisional] Esta es la página de inicio. Aquí puedes presentar tu trabajo, tu propuesta o lo que quieras contar después de la exposición.',
    ],
  },
  {
    slug: 'sobre-mi',
    order: 2,
    title: 'Sobre nosotros',
    subtitle: '[Texto provisional] Las cuatro personas detrás de la exposición.',
    paragraphs: ['[Texto provisional] Cuenta aquí qué las une y cómo trabajan en equipo.'],
    // Una entrada por persona. `photo` es opcional (ej. '/team/ana.jpg' en client/public/team/).
    people: [
      { name: 'Nombre Apellido', role: 'Rol o especialidad', bio: '[Texto provisional] Breve presentación de la primera persona.', photo: '' },
      { name: 'Nombre Apellido', role: 'Rol o especialidad', bio: '[Texto provisional] Breve presentación de la segunda persona.', photo: '' },
      { name: 'Nombre Apellido', role: 'Rol o especialidad', bio: '[Texto provisional] Breve presentación de la tercera persona.', photo: '' },
      { name: 'Nombre Apellido', role: 'Rol o especialidad', bio: '[Texto provisional] Breve presentación de la cuarta persona.', photo: '' },
    ],
  },
];
