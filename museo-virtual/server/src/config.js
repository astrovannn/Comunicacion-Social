/**
 * Configuración centralizada del servidor.
 * Todo lo que depende del entorno se lee aquí, en un único lugar.
 */
const isProd = process.env.NODE_ENV === 'production';
const secret = process.env.JWT_SECRET;

if (isProd && (!secret || secret.length < 32)) {
  throw new Error('JWT_SECRET es obligatorio en producción y debe tener al menos 32 caracteres.');
}
if (!isProd && !secret) {
  console.warn('[config] JWT_SECRET no está definido: se usa un valor de desarrollo. No lo uses en producción.');
}

export const config = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/museo-virtual',
  jwtSecret: secret || 'solo-para-desarrollo-no-usar-en-produccion',
  trustProxy: process.env.TRUST_PROXY === '1',
  visitorCookie: 'mv_visitor',
};
