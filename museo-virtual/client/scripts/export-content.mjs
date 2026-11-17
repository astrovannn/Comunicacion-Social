/**
 * Copia el contenido de server/src/seed/data.js a src/data/content.js para la versión
 * estática (Netlify). Así hay UNA sola fuente de verdad: edita data.js y vuelve a compilar.
 *
 *   node scripts/export-content.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const source = new URL('../../server/src/seed/data.js', import.meta.url);
const target = new URL('../src/data/content.js', import.meta.url);

const { artworks, sections } = await import(source.href);

const banner = `// ARCHIVO GENERADO por scripts/export-content.mjs a partir de server/src/seed/data.js.\n// No lo edites a mano: cambia data.js y ejecuta \`npm run build\` (o \`npm run content\`).\n`;
const body =
  `export const artworks = ${JSON.stringify(artworks, null, 2)};\n\n` +
  `export const sections = ${JSON.stringify(sections, null, 2)};\n`;

mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true });
writeFileSync(target, banner + '\n' + body);
console.log(`content.js: ${artworks.length} obras y ${sections.length} secciones.`);
