import { Router } from 'express';
import { registrarPersona } from '../controllers/personas.controller.js';

const router = Router();

// POST /api/personas — Registro de perfil de persona/reciclador individual
router.post('/', registrarPersona);

export default router;
