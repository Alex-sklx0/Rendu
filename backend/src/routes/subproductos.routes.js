import { Router } from 'express';
import {
	actualizarSubproducto,
	misPublicaciones,
	obtenerSubproducto,
	registrarSubproducto,
} from '../controllers/subproductos.controller.js';

const router = Router();

// POST /api/subproductos — HU-03 a HU-06: Registro de subproducto
// Forma del request/response definida en /docs/api-contract.md
router.post('/', registrarSubproducto);
router.get('/mis-publicaciones', misPublicaciones);
router.get('/:id', obtenerSubproducto);
router.patch('/:id', actualizarSubproducto);

export default router;
