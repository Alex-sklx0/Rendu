import { Router } from 'express';
import { postInteres, getContacto } from '../controllers/interes.controller.js';
import { autenticarOpcional } from '../middlewares/auth.js';

const router = Router();

router.use(autenticarOpcional);

// POST /api/interes          -> Manifestar interés, sin duplicados (HU-17)
// GET  /api/interes/contacto -> Link de redirección al contacto (HU-19)
router.post('/', postInteres);
router.get('/contacto', getContacto);

export default router;