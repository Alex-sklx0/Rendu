import { Router } from 'express';
import { postRegistrarEmpresa } from '../controllers/empresas.controller.js';

const router = Router();

// POST /empresas  -> Registrar empresa (HU-02)
router.post('/', postRegistrarEmpresa);

export default router;