import { Router } from 'express';
import { getInteresados } from '../controllers/interes.controller.js';
import { autenticarOpcional } from '../middlewares/auth.js';

const router = Router();

router.use(autenticarOpcional);

// GET /api/mis-publicaciones/interesados -> Interesados en mis publicaciones (HU-18)
router.get('/interesados', getInteresados);

export default router;