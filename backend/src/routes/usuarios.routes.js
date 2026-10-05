import { Router } from 'express';
import { postRegistrarUsuario, postLoginUsuario, deleteUsuario } from '../controllers/usuarios.controller.js';

const router = Router();

// POST /api/usuarios       — registrar usuario
// POST /api/usuarios/login — iniciar sesión
// DELETE /api/usuarios/:id — eliminar cuenta
router.post('/', postRegistrarUsuario);
router.post('/login', postLoginUsuario);
router.delete('/:id', deleteUsuario);

export default router;
