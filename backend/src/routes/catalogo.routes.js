import { Router } from 'express';
import { getCatalogo } from '../controllers/catalogo.controller.js';

const router = Router();

// GET /api/catalogo — subproductos publicados y disponibles
router.get('/', getCatalogo);

export default router;
