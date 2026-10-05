import { Router } from 'express';
import { postRegistrarUsuario, postLoginUsuario, deleteUsuario } from '../controllers/usuarios.controller.js';

const router = Router();

// POST /api/usuarios       -> Registrar usuario (HU-01)
// POST /api/usuarios/login -> Iniciar sesión
// DELETE /api/usuarios/:id -> Eliminar cuenta
router.post('/', postRegistrarUsuario);
router.post('/login', postLoginUsuario);
router.delete('/:id', deleteUsuario);

export default router;