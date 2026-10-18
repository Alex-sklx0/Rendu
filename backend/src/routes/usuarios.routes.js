import { Router } from 'express';
import { postRegistrarUsuario, postLoginUsuario, getMe, deleteUsuario } from '../controllers/usuarios.controller.js';
import { autenticarOpcional, requerirAuth } from '../middlewares/auth.js';

const router = Router();

// POST   /api/usuarios       -> Registrar usuario (HU-01), devuelve token
// POST   /api/usuarios/login -> Iniciar sesión, devuelve token
// GET    /api/usuarios/me    -> Perfil de la sesión (requiere token)
// DELETE /api/usuarios/:id   -> Eliminar cuenta (con token, solo la propia)
router.post('/', postRegistrarUsuario);
router.post('/login', postLoginUsuario);
router.get('/me', autenticarOpcional, requerirAuth, getMe);
router.delete('/:id', autenticarOpcional, deleteUsuario);

export default router;