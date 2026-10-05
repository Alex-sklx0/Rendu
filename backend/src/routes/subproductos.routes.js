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

const router = Router();

router.post('/', postRegistrarSubproducto);           // registrar (nace en borrador)
router.post('/upload', postSubirImagen);              // subir imagen suelta
router.get('/mis-publicaciones', getMisPublicaciones); // listar propias (incluye borradores)
router.get('/:id', getSubproducto);                   // detalle (para el dueño)
router.patch('/:id', patchSubproducto);               // editar
router.patch('/:id/publicar', patchPublicarSubproducto); // publicar o pasar a borrador
router.delete('/:id', deleteSubproducto);             // eliminar

export default router;
