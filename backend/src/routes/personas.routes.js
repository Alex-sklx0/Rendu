import { Router } from 'express';
import {
  postRegistrarPersona,
  putActualizarPersona,
  getVerificarCedula,
} from '../controllers/personas.controller.js';
import { autenticarOpcional, requerirAuth } from '../middlewares/auth.js';
import { validarId } from '../middlewares/validaciones.js';

const router = Router();

// GET   /api/personas/verificar-cedula/:cedula -> Verificar disponibilidad de cédula (público)
router.get('/verificar-cedula/:cedula', getVerificarCedula);

router.use(autenticarOpcional, requerirAuth);
router.param('id', validarId);

// POST  /api/personas     -> Registrar persona (HU-01)
// PUT   /api/personas/:id -> Actualizar datos de persona
// PATCH /api/personas/:id -> Actualizar datos de persona
router.post('/', postRegistrarPersona);
router.put('/:id', putActualizarPersona);
router.patch('/:id', putActualizarPersona);

export default router;