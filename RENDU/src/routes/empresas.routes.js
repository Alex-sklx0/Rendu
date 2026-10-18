import { Router } from 'express';
import { postRegistrarEmpresa } from '../controllers/empresas.controller.js';
import { autenticarOpcional } from '../middlewares/auth.js';

const router = Router();

router.use(autenticarOpcional);

// POST /empresas  -> Registrar empresa (HU-02)
router.post('/', postRegistrarEmpresa);

export default router;