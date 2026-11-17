/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CONTENIDO DEL MUSEO
 *  Después de editar este archivo ejecuta `npm run seed` en /server para
 *  actualizar la base de datos (sin eso la página sigue mostrando lo anterior).
 *
 *  - slug:      identificador único en minúsculas y con guiones (no lo cambies
 *               después de publicar o se perderá el progreso de esa obra).
 *  - imageUrl:  ruta de la imagen dentro de client/public/art.
 *  - aspect:    ancho/alto del marco (0.8 vertical, 1 cuadrado, 1.5 horizontal).
 *  - room:      número de sala; roomName: nombre de la sala.
 *  - mandatory: false si la obra no debe ser obligatoria para el recorrido.
 *  - author, date, technique, dimensions: opcionales; si se dejan vacíos
 *               simplemente no se muestran en la ficha de la obra.
 *  - extra:     datos adicionales opcionales [{ label, value }].
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Fotos horizontales de 3:2 → aspect 1.5. */
const photo = (n, { room, roomName, order, title, description, scene, alt }) => ({
  slug: `obra-${n}`,
  title,
  author: '',
  date: '',
  technique: '',
  dimensions: '',
  description,
  imageUrl: `/art/obra-${n}.jpg`,
  alt,
  aspect: 1.5,
  room,
  roomName,
  order,
  mandatory: true,
  extra: [{ label: 'Escena', value: scene }],
});

const TERRASSE = { room: 1, roomName: 'Terrasse' };
const ADUANA = { room: 2, roomName: 'Plaza de la Aduana' };
const BOLIVAR = { room: 3, roomName: 'Museo Simón Bolívar' };
const BIBLIOTECA = { room: 4, roomName: 'Biblioteca Universidad del Norte' };

export const artworks = [
  // Sala I · Terrasse
  photo(1, {
    ...TERRASSE,
    order: 1,
    title: 'Ballet',
    description: 'Principios de delicadeza y precisión en la técnica.',
    scene: 'Lau',
    alt: 'Una bailarina de ballet con tutú verde y dorado posa en puntas junto a un panel rojo de patrón ondulado.',
  }),
  photo(2, {
    ...TERRASSE,
    order: 2,
    title: 'Cumbia',
    description: 'Indicios de picardía, coqueteo y recital poético con el cuerpo.',
    scene: 'Santiago',
    alt: 'Un bailarín con sombrero vueltiao, camisa blanca y capa roja brillante se apoya en el marco de un panel rojo.',
  }),
  photo(3, {
    ...TERRASSE,
    order: 3,
    title: 'Sinfonía',
    description: 'Armonía del lenguaje que admira otra pasión.',
    scene: 'Lau danza, Santiago admira atrás',
    alt: 'Visto desde atrás, un joven con capa roja brillante observa a una bailarina que cruza el salón rojo al fondo.',
  }),
  photo(4, {
    ...TERRASSE,
    order: 4,
    title: 'Perspectiva',
    description: 'Sentir de equivalencia, contingencia contraria.',
    scene: 'Perspectiva de Santiago',
    alt: 'Una bailarina posa en puntas en un salón de mesas y sillas rojas, mientras un joven la mira desde una mesa al fondo.',
  }),

  // Sala II · Plaza de la Aduana
  photo(5, {
    ...ADUANA,
    order: 1,
    title: 'Dualidad',
    description: 'Expresiones encontradas bajo una misma sintonía.',
    scene: 'Aduana, separados por una columna',
    alt: 'En un corredor de columnas de madera, una bailarina de verde posa a un lado y un bailarín levanta su sombrero vueltiao al otro.',
  }),
  photo(6, {
    ...ADUANA,
    order: 2,
    title: 'Cortejo de luz',
    description: 'Galanteo admirable que inspira ternura.',
    scene: 'Aduana, banquitos',
    alt: 'Frente a una pared amarilla, un bailarín sentado en una banca extiende un pequeño objeto rojo hacia una bailarina recostada en otra banca.',
  }),

  // Sala III · Museo Simón Bolívar
  photo(7, {
    ...BOLIVAR,
    order: 1,
    title: 'Notar',
    description: 'Llevaba consigo mismo el arte de mirar.',
    scene: 'Museo, Simón Bolívar',
    alt: 'En una sala de museo con retratos al óleo, un bailarín con sombrero vueltiao está sentado en una silla y una bailarina se apoya junto a él.',
  }),
  photo(8, {
    ...BOLIVAR,
    order: 2,
    title: 'Tacto',
    description: 'Un sutil roce físico que les logra enlazar.',
    scene: 'Museo, sentados juntos',
    alt: 'Una bailarina y un bailarín sentados juntos en un sillón tallado, frente a vitrinas con libros sobre fondo rojo.',
  }),

  // Sala IV · Biblioteca Universidad del Norte
  photo(9, {
    ...BIBLIOTECA,
    order: 1,
    title: 'Arte',
    description: 'Lírica visual de cohesión etérea.',
    scene: 'Ventanal, cerca a las escaleras',
    alt: 'En una escalera frente a un gran vitral de colores, una bailarina y un bailarín se toman de las manos; él sostiene su sombrero vueltiao.',
  }),
  photo(10, {
    ...BIBLIOTECA,
    order: 2,
    title: 'Coincidir',
    description: 'Metáfora de unión como soplo incorpóreo que da vida.',
    scene: 'Ventanal, juntos',
    alt: 'Vista desde arriba, una bailarina y un bailarín posan juntos junto a la baranda de un gran vitral de colores.',
  }),
];

export const sections = [
  {
    slug: 'inicio',
    order: 1,
    title: 'Bienvenido al otro lado',
    subtitle: 'Has completado el recorrido: ahora puedes explorar el resto del sitio.',
    paragraphs: [
      'Recorriste diez obras en cuatro escenarios: la Terrasse, la Plaza de la Aduana, el Museo Simón Bolívar y la Biblioteca de la Universidad del Norte. Aquí puedes volver a abrir cualquiera de ellas.',
    ],
  },
  {
    slug: 'sobre-mi',
    order: 2,
    title: 'Sobre nosotros',
    subtitle: 'Las cuatro personas detrás de la exposición.',
    paragraphs: ['Esta exposición fue posible gracias al trabajo de estas cuatro personas.'],
    // `photo` es opcional (ej. '/team/laura.jpg' en client/public/team/); `bio` también.
    people: [
      { name: 'Laura Valentina Ariza Ruiz', role: 'Modelo, editora de fotografía y página web', bio: '', photo: '' },
      { name: 'Lusiana Sofia Vanegas Barrios', role: 'Cámara', bio: '', photo: '' },
      { name: 'Marianne Andrea Rojas Rubio', role: 'Apoyo en cámara y logística', bio: '', photo: '' },
      { name: 'Sofía Hernández Paz', role: 'Apoyo a cámara', bio: '', photo: '' },
    ],
  },
];
