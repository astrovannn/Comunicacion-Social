# Museo Virtual

Sitio web con un museo virtual como página principal. El visitante debe abrir **todas las obras** para desbloquear el resto del sitio (Inicio y Sobre nosotros). Stack: React (Vite) · Node + Express · MongoDB.

> Todo el contenido actual (obras, textos e imágenes) es **provisional**. Ver [Cómo poner tu contenido real](#cómo-poner-tu-contenido-real).

## Distribución de las salas

El museo tiene **4 salas** con **4 · 2 · 2 · 2 obras** (10 en total): Origen (4), Materia (2), Luz (2) y Eco (2). Cada sala es un pasillo y entre ellas se gira a la izquierda. Para cambiar la distribución basta con editar `room`, `roomName` y `order` en `server/src/seed/data.js` y ejecutar `npm run seed -- --prune`. La geometría vive en `client/src/utils/corridorLayout.js`: si el recorrido da la vuelta y un pasillo chocaría con otro, alarga solo el que haga falta.

Las imágenes `obra-9.svg` y `obra-10.svg` (y el resto) son placeholders: reemplázalos por tus fotos.

## Cómo funciona el desbloqueo

| Capa | Qué hace |
|---|---|
| **Servidor (fuente de verdad)** | Cada visitante recibe una cookie firmada `httpOnly` (no se puede leer ni editar desde JavaScript). Cada vez que abre una obra, el cliente llama a `POST /api/visits/:slug` y el servidor la guarda con un índice único (visitante + obra), así que nunca se cuenta dos veces. |
| **Protección real** | El contenido de Inicio, Sobre mí y Contacto vive en MongoDB y solo se entrega por `GET /api/site/:seccion`, que responde `403` si el servidor no ve todas las obras obligatorias visitadas. Editar el DOM, cambiar el hash de la URL o tocar `localStorage` no revela nada. |
| **localStorage** | Solo cachea qué obras se ven como descubiertas para que la barra de progreso aparezca al instante tras recargar. Nunca decide el desbloqueo: `completed` viene siempre del servidor. |

Como el estado se recalcula en cada petición, si agregas una obra obligatoria nueva el sitio vuelve a bloquearse hasta que el visitante la descubra.

## Estructura

```
museo-virtual/
├── server/
│   └── src/
│       ├── index.js · app.js · config.js
│       ├── models/        Artwork, Visit, SiteSection, Message
│       ├── routes/        artworks, progress (+visits), site, contact
│       ├── middleware/    visitor (cookie firmada), requireCompletion (403)
│       ├── services/      progress (cálculo del recorrido)
│       └── seed/          data.js (TU CONTENIDO) + seed.js
└── client/
    ├── public/art/        imágenes de las obras
    └── src/
        ├── App.jsx                 vistas y desbloqueo
        ├── components/             Museum, MuseumRoom, Artwork, ArtworkModal,
        │                           ProgressBar, CompletionOverlay, Navbar,
        │                           SiteSection, ContactForm, StatusMessage
        ├── utils/corridorLayout.js geometría 3D del recorrido
        ├── hooks/                  useArtworks, useProgress, useHashView, useInView
        ├── services/api.js         única capa que llama al backend
        └── styles/                 base, museum, modal, site
```

## Puesta en marcha

Requisitos: Node 20.6+ y una instancia de MongoDB (local o Atlas).

```bash
# 1. Servidor
cd server
cp .env.example .env        # ajusta MONGODB_URI y JWT_SECRET
npm install
npm run seed                # carga obras y secciones en MongoDB
npm run dev                 # http://localhost:5000

# 2. Cliente (otra terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Vite reenvía `/api` al puerto 5000, así que la cookie es del mismo origen y no hace falta CORS.

### Producción

```bash
cd client && npm run build          # genera client/dist
cd ../server && NODE_ENV=production npm start
```

Si existe `client/dist`, Express lo sirve junto con la API (un solo servicio). En producción `JWT_SECRET` es obligatorio (mínimo 32 caracteres) y, detrás de un proxy (Render, Railway, Nginx…), define `TRUST_PROXY=1`.

## Cómo poner tu contenido real

1. Copia tus fotos a `client/public/art/` (por ejemplo `mi-foto.jpg`).
2. Edita `server/src/seed/data.js`: por obra, `slug`, título, autor, fecha, técnica, dimensiones, historia (`description`), `imageUrl` (`/art/mi-foto.jpg`), `alt`, `room`/`roomName`, `order` y `aspect` (0.8 vertical · 1 cuadrada · 1.5 horizontal). Datos extra opcionales en `extra: [{ label, value }]`.
3. Edita ahí mismo los textos de las secciones (Inicio y Sobre nosotros); cada elemento de `paragraphs` es un párrafo y, en Sobre nosotros, `people` lleva las 4 personas (nombre, rol, bio y foto opcional). Inicio muestra solas las obras, ordenadas por sala.
4. Ejecuta `npm run seed` en `/server` (agrega `-- --prune` para borrar las que quitaste del archivo).
5. Cambia el nombre del sitio en `client/src/config.js`.

No cambies el `slug` de una obra ya publicada: el progreso de los visitantes se guarda por `slug`.

Para que una obra no sea obligatoria, pon `mandatory: false`.

## API

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/artworks` | público | Catálogo ordenado por sala |
| GET | `/api/progress` | visitante | Obras vistas y si el recorrido está completo |
| POST | `/api/visits/:slug` | visitante | Registra una obra (idempotente) |
| GET | `/api/site/:seccion` | **recorrido completo** | Contenido de una sección |

## Limitaciones conocidas

- La identidad del visitante es anónima y está ligada a su navegador (cookie). Si la borra, empieza de cero; no hay cuentas de usuario.
- Las imágenes de las obras son públicas (`/art/...`): lo bloqueado es el contenido de las secciones, no las imágenes del museo.
