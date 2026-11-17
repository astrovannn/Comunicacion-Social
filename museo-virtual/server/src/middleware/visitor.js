import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { config } from '../config.js';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Identifica al visitante de forma anónima con una cookie firmada y httpOnly.
 * JavaScript del navegador no puede leerla ni modificarla, y si alguien la
 * altera la firma deja de ser válida y se le asigna un visitante nuevo (sin progreso).
 *
 * Deja el id en `req.visitorId`.
 */
export function ensureVisitor(req, res, next) {
  const token = req.cookies?.[config.visitorCookie];

  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      if (typeof payload.vid === 'string') {
        req.visitorId = payload.vid;
        return next();
      }
    } catch {
      // Cookie inválida o vencida: se emite una nueva abajo.
    }
  }

  const vid = randomUUID();
  const newToken = jwt.sign({ vid }, config.jwtSecret, { expiresIn: '365d' });
  res.cookie(config.visitorCookie, newToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProd,
    maxAge: ONE_YEAR_MS,
  });
  req.visitorId = vid;
  next();
}
