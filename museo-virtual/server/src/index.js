import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config.js';

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log('[db] conectado a MongoDB');

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[server] escuchando en http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('[server] no se pudo iniciar:', err.message);
  process.exit(1);
});
