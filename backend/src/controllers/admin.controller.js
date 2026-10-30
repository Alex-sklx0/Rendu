import {
  listarTodosSubproductos,
  cambiarEstadoPublicacion,
  actualizarSubproducto,
  eliminarSubproducto,
} from '../services/subproductos.service.js';
import { listarUsuarios, cambiarSuspension } from '../services/admin.service.js';
import { listarInteresados } from '../services/interes.service.js';
import { deleteStorageFile } from '../services/storage.service.js';
import { registrarAccionAdmin } from '../services/auditoria.service.js';
import { esAdmin } from '../middlewares/auth.js';

const esId = (v) => v !== undefined && v !== null && /^\d{1,15}$/.test(String(v));

// GET /api/admin/usuarios
export async function getUsuariosAdmin(req, res, next) {
  try {
    const usuarios = await listarUsuarios();
    return res.status(200).json({ ok: true, total: usuarios.length, usuarios });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/usuarios/:id/suspender
export async function patchSuspenderUsuario(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (id === req.usuario.id) {
      return res.status(403).json({ ok: false, error: 'No puedes suspender tu propia cuenta' });
    }
    if (esAdmin(id)) {
      return res.status(403).json({ ok: false, error: 'No se puede suspender a un administrador' });
    }

    const usuario = await cambiarSuspension(id, true);
    registrarAccionAdmin(req, 'SUSPENDER_USUARIO', { id_usuario: id });
    return res.status(200).json({ ok: true, mensaje: 'Usuario suspendido', usuario });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/usuarios/:id/reactivar
export async function patchReactivarUsuario(req, res, next) {
  try {
    const id = Number(req.params.id);
    const usuario = await cambiarSuspension(id, false);
    registrarAccionAdmin(req, 'REACTIVAR_USUARIO', { id_usuario: id });
    return res.status(200).json({ ok: true, mensaje: 'Usuario reactivado', usuario });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/subproductos?estado=1|2 (opcional)
export async function getTodosSubproductos(req, res, next) {
  try {
    const { estado } = req.query;
    if (estado !== undefined && !['1', '2'].includes(String(estado))) {
      return res.status(400).json({ ok: false, error: 'estado debe ser 1 (BORRADOR) o 2 (PUBLICADO)' });
    }
    const subproductos = await listarTodosSubproductos(estado !== undefined ? Number(estado) : null);
    return res.status(200).json({ ok: true, total: subproductos.length, subproductos });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/interesados?id_empresa=&id_publicacion= (solo lectura)
export async function getInteresadosAdmin(req, res, next) {
  try {
    const { id_empresa, id_publicacion } = req.query;

    if (!esId(id_empresa)) {
      return res.status(400).json({ ok: false, error: 'id_empresa es obligatorio y numérico' });
    }
    if (id_publicacion !== undefined && !esId(id_publicacion)) {
      return res.status(400).json({ ok: false, error: 'id_publicacion debe ser numérico' });
    }

    const interesados = await listarInteresados(
      Number(id_empresa),
      id_publicacion !== undefined ? Number(id_publicacion) : null
    );

    return res.status(200).json({ ok: true, total: interesados.length, interesados });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/subproductos/:id/despublicar — moderación: el admin solo puede despublicar
export async function patchDespublicarAdmin(req, res, next) {
  try {
    const id = Number(req.params.id);
    const subproducto = await cambiarEstadoPublicacion(id, null, false, { esAdmin: true });
    registrarAccionAdmin(req, 'DESPUBLICAR_SUBPRODUCTO', { id_subproducto: id });
    return res.status(200).json({ ok: true, mensaje: 'Publicación despublicada por moderación', subproducto });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/subproductos/:id/disponibilidad  Body: { disponible: boolean }
export async function patchDisponibilidadAdmin(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { disponible } = req.body ?? {};

    if (typeof disponible !== 'boolean') {
      return res.status(400).json({ ok: false, error: 'El campo "disponible" debe ser true o false' });
    }

    const subproducto = await actualizarSubproducto(id, null, { disponible }, { esAdmin: true });
    registrarAccionAdmin(req, 'CAMBIAR_DISPONIBILIDAD', { id_subproducto: id, disponible });
    return res.status(200).json({ ok: true, mensaje: 'Disponibilidad actualizada', subproducto });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/subproductos/:id
export async function deleteSubproductoAdmin(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { foto_url } = await eliminarSubproducto(id, null, { esAdmin: true });
    if (foto_url) await deleteStorageFile(foto_url);
    registrarAccionAdmin(req, 'ELIMINAR_SUBPRODUCTO', { id_subproducto: id });
    return res.status(200).json({ ok: true, mensaje: 'Subproducto eliminado por un administrador' });
  } catch (error) {
    next(error);
  }
}