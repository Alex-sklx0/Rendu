import { Router } from 'express';
import { getPublicacion } from '../controllers/publicaciones.controller.js';

const router = Router();

// GET /api/publicaciones/:id -> Detalle de una publicación activa (HU-16)
router.get('/:id', getPublicacion);

export default router;