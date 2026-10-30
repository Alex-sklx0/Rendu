import { Router } from 'express';
import {
  postRegistrarUsuario,
  postLoginUsuario,
  getMe,
  deleteUsuario,
  postSubirAvatar,
} from '../controllers/usuarios.controller.js';
import { autenticarOpcional, requerirAuth } from '../middlewares/auth.js';
import { validarId } from '../middlewares/validaciones.js';
import { limiterLogin, limiterRegistro } from '../middlewares/rateLimit.js';

const router = Router();
router.param('id', validarId);

// POST   /api/usuarios        -> Registrar usuario (HU-01), devuelve token
// POST   /api/usuarios/login  -> Iniciar sesión, devuelve token
// GET    /api/usuarios/me     -> Perfil de la sesión (requiere token)
// POST   /api/usuarios/avatar -> Subir foto de perfil
// DELETE /api/usuarios/:id    -> Eliminar cuenta (con token, solo la propia)
router.post('/', limiterRegistro, postRegistrarUsuario);
router.post('/login', limiterLogin, postLoginUsuario);
router.get('/me', autenticarOpcional, requerirAuth, getMe);
router.post('/avatar', autenticarOpcional, requerirAuth, postSubirAvatar);
router.delete('/:id', autenticarOpcional, requerirAuth, deleteUsuario);

export default router;