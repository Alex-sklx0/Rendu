import { Router } from 'express';
import {
  postRegistrarSubproducto,
  getSubproducto,
  getMisPublicaciones,
  patchSubproducto,
  deleteSubproducto,
  patchPublicarSubproducto,
  postSubirImagen,
} from '../controllers/subproductos.controller.js';
import { autenticarOpcional, requerirAuth } from '../middlewares/auth.js';
import { validarId } from '../middlewares/validaciones.js';
import { limiterUpload } from '../middlewares/rateLimit.js';

const router = Router();

router.use(autenticarOpcional, requerirAuth);
router.param('id', validarId);

router.post('/', limiterUpload, postRegistrarSubproducto); // HU-03 a HU-06: registrar
router.post('/upload', limiterUpload, postSubirImagen); // HU-08: subir imagen suelta

router.get('/mis-publicaciones', getMisPublicaciones); // HU-07/HU-09: listar publicaciones propias
router.get('/:id', getSubproducto); // HU-10: detalle (valida dueño o admin)

router.patch('/:id', patchSubproducto); // HU-11: editar (valida dueño)
router.patch('/:id/publicar', patchPublicarSubproducto); // HU-07: publicar/despublicar (valida dueño)
router.delete('/:id', deleteSubproducto); // eliminar (valida dueño)

export default router;