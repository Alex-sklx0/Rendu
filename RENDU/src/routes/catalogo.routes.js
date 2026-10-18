import { Router } from 'express';
import { getCatalogo } from '../controllers/catalogo.controller.js';
import { autenticarOpcional } from '../middlewares/auth.js';

const router = Router();

// GET /api/catalogo -> Listado de subproductos publicados y disponibles (HU-09)
router.get('/', autenticarOpcional, getCatalogo);

export default router;