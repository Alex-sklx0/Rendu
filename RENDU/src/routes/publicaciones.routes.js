import { Router } from 'express';
import { getPublicacion } from '../controllers/publicaciones.controller.js';
import { autenticarOpcional } from '../middlewares/auth.js';

const router = Router();

// GET /api/publicaciones/:id -> Detalle de una publicación activa (HU-16)
router.get('/:id', autenticarOpcional, getPublicacion);

export default router;