import { Router } from 'express';
import { registrarSubproducto } from '../controllers/subproductos.controller.js';

const router = Router();

// POST /api/subproductos — HU-03 a HU-06: Registro de subproducto
// Forma del request/response definida en /docs/api-contract.md
router.post('/', registrarSubproducto);

export default router;
