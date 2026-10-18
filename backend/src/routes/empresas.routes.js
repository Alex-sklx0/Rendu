import { Router } from 'express';
import { postRegistrarEmpresa, patchContactoEmpresa } from '../controllers/empresas.controller.js';
import { autenticarOpcional } from '../middlewares/auth.js';

const router = Router();

router.use(autenticarOpcional);

// POST /empresas             -> Registrar empresa (HU-02)
// PATCH /empresas/:id/contacto -> Actualizar medio de contacto
router.post('/', postRegistrarEmpresa);
router.patch('/:id/contacto', patchContactoEmpresa);

export default router;