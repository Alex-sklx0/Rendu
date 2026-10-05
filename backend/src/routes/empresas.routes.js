import { Router } from 'express';
import { postRegistrarEmpresa } from '../controllers/empresas.controller.js';

const router = Router();

// POST /api/empresas — Registro de empresa (HU-02)
router.post('/', postRegistrarEmpresa);

export default router;
