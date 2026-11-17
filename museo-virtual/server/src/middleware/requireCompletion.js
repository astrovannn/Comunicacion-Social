import { getProgress } from '../services/progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Protege cualquier ruta que sirva contenido del "resto del sitio".
 * Consulta la base de datos en cada petición: no confía en nada que el
 * navegador pueda manipular (estado de React, localStorage, botones en el DOM).
 */
export const requireCompletion = asyncHandler(async (req, res, next) => {
  const { completed, requiredDone, requiredTotal } = await getProgress(req.visitorId);

  if (!completed) {
    return res.status(403).json({
      error: 'locked',
      message: 'Completa el recorrido del museo para acceder a esta sección.',
      requiredDone,
      requiredTotal,
    });
  }
  next();
});
