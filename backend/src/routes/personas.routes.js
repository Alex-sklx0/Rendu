import { Router } from 'express';
import { postRegistrarPersona } from '../controllers/personas.controller.js';
import { autenticarOpcional } from '../middlewares/auth.js';

const router = Router();

router.use(autenticarOpcional);

router.post('/', postRegistrarPersona);

export default router;