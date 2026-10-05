import { Router } from 'express';
import { postRegistrarPersona } from '../controllers/personas.controller.js';

const router = Router();

router.post('/', postRegistrarPersona);

export default router;