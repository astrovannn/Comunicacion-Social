import { Router } from 'express';
import { Artwork } from '../models/Artwork.js';
import { Visit } from '../models/Visit.js';
import { getProgress } from '../services/progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const SLUG_RE = /^[a-z0-9-]{1,80}$/;

/** GET /api/progress — estado del recorrido del visitante actual. */
router.get(
  '/progress',
  asyncHandler(async (req, res) => {
    res.json(await getProgress(req.visitorId));
  }),
);

/**
 * POST /api/visits/:slug — registra que el visitante abrió una obra.
 * Es idempotente: repetirla no cuenta la obra dos veces.
 */
router.post(
  '/visits/:slug',
  asyncHandler(async (req, res) => {
    const { slug } = req.params;

    if (!SLUG_RE.test(slug)) {
      return res.status(400).json({ error: 'invalid_slug' });
    }
    if (!(await Artwork.exists({ slug }))) {
      return res.status(404).json({ error: 'artwork_not_found' });
    }

    try {
      await Visit.updateOne(
        { visitorId: req.visitorId, artworkSlug: slug },
        { $setOnInsert: { visitedAt: new Date() } },
        { upsert: true },
      );
    } catch (err) {
      // Dos peticiones simultáneas pueden chocar con el índice único: no es un error real.
      if (err?.code !== 11000) throw err;
    }

    res.json(await getProgress(req.visitorId));
  }),
);

export default router;
