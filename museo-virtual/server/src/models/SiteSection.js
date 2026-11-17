import mongoose from 'mongoose';

/**
 * Contenido de las secciones que se desbloquean al terminar el recorrido
 * (Inicio y Sobre nosotros). Vive en la base de datos —no en el bundle de
 * React— para que no se pueda leer sin haber completado el museo.
 */
const siteSectionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, match: /^[a-z0-9-]+$/ },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    paragraphs: { type: [String], default: [] },
    // Solo para «Sobre nosotros»: las personas del equipo.
    people: {
      type: [{ name: String, role: String, bio: String, photo: String, _id: false }],
      default: [],
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const SiteSection = mongoose.model('SiteSection', siteSectionSchema);
