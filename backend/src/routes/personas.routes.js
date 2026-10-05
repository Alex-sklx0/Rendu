import { Router } from 'express';
import { postRegistrarPersona } from '../controllers/personas.controller.js';

const router = Router();

// POST /api/personas — Registro de persona natural o reciclador (HU-01)
router.post('/', postRegistrarPersona);

export default router;
