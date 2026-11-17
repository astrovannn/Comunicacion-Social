/**
 * Carga (o actualiza) las obras y secciones en MongoDB a partir de ./data.js.
 *
 *   npm run seed            → inserta o actualiza por `slug`; no borra nada.
 *   npm run seed -- --prune → además elimina las obras/secciones que ya no estén en data.js.
 *
 * El progreso de los visitantes (colección Visit) nunca se toca.
 */
import mongoose from 'mongoose';
import { config } from '../config.js';
import { Artwork } from '../models/Artwork.js';
import { SiteSection } from '../models/SiteSection.js';
import { artworks, sections } from './data.js';

const prune = process.argv.includes('--prune');

async function upsertAll(Model, docs) {
  const ops = docs.map((doc) => ({
    updateOne: { filter: { slug: doc.slug }, update: { $set: doc }, upsert: true },
  }));
  await Model.bulkWrite(ops);
  if (prune) {
    const { deletedCount } = await Model.deleteMany({ slug: { $nin: docs.map((d) => d.slug) } });
    if (deletedCount) console.log(`  · ${deletedCount} eliminados de ${Model.modelName}`);
  }
}

async function main() {
  await mongoose.connect(config.mongoUri);
  await upsertAll(Artwork, artworks);
  await upsertAll(SiteSection, sections);
  console.log(`Seed listo: ${artworks.length} obras y ${sections.length} secciones.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed fallido:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
