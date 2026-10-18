import { registrarInteres, obtenerContacto, listarInteresados } from '../services/interes.service.js';

const esId = (v) => v !== undefined && v !== null && /^\d+$/.test(String(v));

/**
 * POST /api/interes — HU-17
 * Con token: solo { id_publicacion } (el usuario sale del token).
 * Sin token (modo compatible): { id_usuario, id_publicacion }.
 */
export async function postInteres(req, res, next) {
  try {
    const { id_usuario, id_publicacion } = req.body ?? {};
    const idUsuario = req.usuario?.id ?? id_usuario;

    if (!esId(idUsuario) || !esId(id_publicacion)) {
      return res.status(400).json({
        ok: false,
        error: 'El campo "id_publicacion" es obligatorio y numérico (y "id_usuario" si no envías token)',
      });
    }

    const { interes, contacto } = await registrarInteres({
      id_usuario: Number(idUsuario),
      id_publicacion: Number(id_publicacion),
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Interés registrado exitosamente',
      interes,
      contacto,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/interes/contacto?id_publicacion=&id_usuario= — HU-19
 * Con token, id_usuario no es necesario.
 */
export async function getContacto(req, res, next) {
  try {
    const { id_usuario, id_publicacion } = req.query;
    const idUsuario = req.usuario?.id ?? id_usuario;

    if (!esId(idUsuario) || !esId(id_publicacion)) {
      return res.status(400).json({
        ok: false,
        error: 'El query param "id_publicacion" es obligatorio y numérico (y "id_usuario" si no envías token)',
      });
    }

    const contacto = await obtenerContacto({
      id_usuario: Number(idUsuario),
      id_publicacion: Number(id_publicacion),
    });

    return res.status(200).json({ ok: true, contacto });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/mis-publicaciones/interesados?id_publicacion=&id_empresa= — HU-18
 * Con token, la empresa sale del token. id_publicacion es opcional.
 */
export async function getInteresados(req, res, next) {
  try {
    const { id_empresa, id_publicacion } = req.query;

    if (req.usuario && !req.usuario.id_empresa) {
      return res.status(403).json({ ok: false, error: 'Tu cuenta no tiene una empresa asociada' });
    }

    const idEmpresa = req.usuario ? req.usuario.id_empresa : id_empresa;

    if (!esId(idEmpresa)) {
      return res.status(400).json({ ok: false, error: 'id_empresa es obligatorio como query param (o envía token) y debe ser numérico' });
    }
    if (id_publicacion !== undefined && !esId(id_publicacion)) {
      return res.status(400).json({ ok: false, error: 'id_publicacion debe ser numérico' });
    }

    const interesados = await listarInteresados(
      Number(idEmpresa),
      id_publicacion !== undefined ? Number(id_publicacion) : null
    );

    return res.status(200).json({
      ok: true,
      total: interesados.length,
      ...(interesados.length === 0 && { mensaje: 'Aún no hay interesados en tus publicaciones' }),
      interesados,
    });
  } catch (error) {
    next(error);
  }
}