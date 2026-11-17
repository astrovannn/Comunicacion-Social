import { Router } from 'express';
import { Artwork } from '../models/Artwork.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

/** GET /api/artworks — catálogo del museo, ordenado por sala y posición. */
router.get(
  '/artworks',
  asyncHandler(async (_req, res) => {
    const artworks = await Artwork.find()
      .sort({ room: 1, order: 1 })
      .select('-_id -__v -createdAt -updatedAt')
      .lean();
    res.json(artworks);
  }),
);

export default router;
