import { Router } from 'express';
import {
  getUsuariosAdmin,
  patchSuspenderUsuario,
  patchReactivarUsuario,
  getTodosSubproductos,
  getInteresadosAdmin,
  patchDespublicarAdmin,
  patchDisponibilidadAdmin,
  deleteSubproductoAdmin,
} from '../controllers/admin.controller.js';
import { autenticarOpcional, requerirAdmin } from '../middlewares/auth.js';
import { validarId } from '../middlewares/validaciones.js';

const router = Router();

router.use(autenticarOpcional, requerirAdmin);
router.param('id', validarId);

// GET    /api/admin/usuarios                                 -> Listar usuarios (incluye suspendido)
// PATCH  /api/admin/usuarios/:id/suspender                   -> Suspender cuenta (no admins)
// PATCH  /api/admin/usuarios/:id/reactivar                   -> Reactivar cuenta
// GET    /api/admin/subproductos?estado=1|2                  -> Todas las publicaciones
// GET    /api/admin/interesados?id_empresa=&id_publicacion=  -> Interesados (solo lectura)
// PATCH  /api/admin/subproductos/:id/despublicar             -> Moderación: solo despublicar
// PATCH  /api/admin/subproductos/:id/disponibilidad          -> Cambiar disponibilidad
// DELETE /api/admin/subproductos/:id                         -> Eliminar subproducto
router.get('/usuarios', getUsuariosAdmin);
router.patch('/usuarios/:id/suspender', patchSuspenderUsuario);
router.patch('/usuarios/:id/reactivar', patchReactivarUsuario);
router.get('/subproductos', getTodosSubproductos);
router.get('/interesados', getInteresadosAdmin);
router.patch('/subproductos/:id/despublicar', patchDespublicarAdmin);
router.patch('/subproductos/:id/disponibilidad', patchDisponibilidadAdmin);
router.delete('/subproductos/:id', deleteSubproductoAdmin);

export default router;