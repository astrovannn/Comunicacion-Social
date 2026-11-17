import { Router } from 'express';
import { SiteSection } from '../models/SiteSection.js';
import { requireCompletion } from '../middleware/requireCompletion.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const SLUG_RE = /^[a-z0-9-]{1,40}$/;

/**
 * GET /api/site/:section — contenido de una sección desbloqueable.
 * Responde 403 si el visitante no ha completado el recorrido.
 */
router.get(
  '/site/:section',
  requireCompletion,
  asyncHandler(async (req, res) => {
    const { section } = req.params;
    if (!SLUG_RE.test(section)) {
      return res.status(400).json({ error: 'invalid_section' });
    }

    const doc = await SiteSection.findOne({ slug: section })
      .select('-_id -__v -createdAt -updatedAt')
      .lean();

    if (!doc) return res.status(404).json({ error: 'section_not_found' });
    res.json(doc);
  }),
);

export default router;
