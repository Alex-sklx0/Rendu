import { Router } from 'express';
import { registrarUsuario } from '../controllers/usuarios.controller.js';

const router = Router();

// POST /api/usuarios — HU-01: Registro de usuario
// Forma del request/response definida en /docs/api-contract.md
router.post('/', registrarUsuario);

export default router;
