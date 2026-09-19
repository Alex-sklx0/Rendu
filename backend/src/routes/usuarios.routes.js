import { Router } from 'express';
import { registrarUsuario, loginUsuario, eliminarUsuario } from '../controllers/usuarios.controller.js';

const router = Router();

// Rutas de usuarios
router.post('/', registrarUsuario);
router.post('/login', loginUsuario);
router.delete('/:id', eliminarUsuario);

export default router;
