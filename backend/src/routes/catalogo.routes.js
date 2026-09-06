import { Router } from 'express';
import { listarCatalogo } from '../controllers/catalogo.controller.js';

const router = Router();

// GET /api/catalogo — HU-09, HU-13, HU-14, HU-15: Catálogo de subproductos disponibles
// Filtros y paginación pendientes de definir con Carolina/Natalia (ver /docs/api-contract.md)
router.get('/', listarCatalogo);

export default router;
