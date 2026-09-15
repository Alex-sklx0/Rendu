import { Router } from 'express';
import { registrarEmpresa } from '../controllers/empresas.controller.js';

const router = Router();

// POST /api/empresas — HU-02: Registro de empresa
// Forma del request/response definida en /docs/api-contract.md
router.post('/', registrarEmpresa);

export default router;
