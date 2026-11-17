import mongoose from 'mongoose';

/** Dato técnico adicional de una obra (ej. "Colección: ..."). */
const specSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

/**
 * Una obra del museo. Cada obra guarda su propia información de forma independiente.
 * - `mandatory`: si es obligatoria para completar el recorrido.
 * - `aspect`: proporción ancho/alto del marco (0.8 = vertical, 1.5 = horizontal).
 * - `room` / `roomName`: sala a la que pertenece y su nombre.
 */
const artworkSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, match: /^[a-z0-9-]+$/ },
    title: { type: String, required: true, trim: true },
    author: { type: String, default: '', trim: true },
    date: { type: String, default: '', trim: true },
    technique: { type: String, default: '', trim: true },
    dimensions: { type: String, default: '', trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    alt: { type: String, default: '' },
    aspect: { type: Number, default: 1, min: 0.5, max: 2 },
    room: { type: Number, required: true, min: 1 },
    roomName: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    mandatory: { type: Boolean, default: true },
    extra: { type: [specSchema], default: [] },
  },
  { timestamps: true },
);

artworkSchema.index({ room: 1, order: 1 });

export const Artwork = mongoose.model('Artwork', artworkSchema);
