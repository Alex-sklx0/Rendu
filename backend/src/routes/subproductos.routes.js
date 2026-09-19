import { Router } from 'express';
import {
	actualizarSubproducto,
	eliminarSubproducto,
	misPublicaciones,
	obtenerSubproducto,
	registrarSubproducto,
	subirImagenSubproducto,
} from '../controllers/subproductos.controller.js';

const router = Router();

// POST /api/subproductos — HU-03 a HU-06: Registro de subproducto
router.post('/', registrarSubproducto);

// POST /api/subproductos/upload — HU-08: Subida de imágenes a Supabase Storage
router.post('/upload', subirImagenSubproducto);

router.get('/mis-publicaciones', misPublicaciones);
router.get('/:id', obtenerSubproducto);
router.patch('/:id', actualizarSubproducto);
router.delete('/:id', eliminarSubproducto);

export default router;
