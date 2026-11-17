import mongoose from 'mongoose';

/**
 * Registro de que un visitante abrió una obra.
 * El índice único (visitorId + artworkSlug) garantiza que una obra
 * nunca se contabilice dos veces para el mismo visitante.
 */
const visitSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  artworkSlug: { type: String, required: true },
  visitedAt: { type: Date, default: Date.now },
});

visitSchema.index({ visitorId: 1, artworkSlug: 1 }, { unique: true });

export const Visit = mongoose.model('Visit', visitSchema);
