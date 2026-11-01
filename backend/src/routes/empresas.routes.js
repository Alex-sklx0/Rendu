import { Router } from 'express';
import {
  postRegistrarEmpresa,
  patchContactoEmpresa,
  putActualizarEmpresa,
  getVerificarNit,
} from '../controllers/empresas.controller.js';
import { autenticarOpcional, requerirAuth } from '../middlewares/auth.js';
import { validarId } from '../middlewares/validaciones.js';

const router = Router();

// GET   /api/empresas/verificar-nit/:nit -> Verificar disponibilidad de NIT (público)
router.get('/verificar-nit/:nit', getVerificarNit);

router.use(autenticarOpcional, requerirAuth);
router.param('id', validarId);

// POST  /api/empresas              -> Registrar empresa (HU-02)
// PATCH /api/empresas/:id/contacto -> Actualizar medio de contacto
// PUT   /api/empresas/:id          -> Actualizar datos de empresa
// PATCH /api/empresas/:id          -> Actualizar datos de empresa
router.post('/', postRegistrarEmpresa);
router.patch('/:id/contacto', patchContactoEmpresa);
router.put('/:id', putActualizarEmpresa);
router.patch('/:id', putActualizarEmpresa);

export default router;