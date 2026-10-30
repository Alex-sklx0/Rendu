import { registrarInteres, obtenerContacto, listarInteresados } from '../services/interes.service.js';

const esId = (v) => v !== undefined && v !== null && /^\d{1,15}$/.test(String(v));

/**
 * POST /api/interes — HU-17
 * Body: { id_publicacion }. El usuario sale siempre del token.
 */
export async function postInteres(req, res, next) {
  try {
    const { id_publicacion } = req.body ?? {};

    if (req.usuario.es_admin) {
      return res.status(403).json({ ok: false, error: 'Un administrador no puede manifestar interés' });
    }

    if (!esId(id_publicacion)) {
      return res.status(400).json({
        ok: false,
        error: 'El campo "id_publicacion" es obligatorio y numérico',
      });
    }

    const { interes, contacto } = await registrarInteres({
      id_usuario: req.usuario.id,
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
 * GET /api/interes/contacto?id_publicacion= — HU-19
 */
export async function getContacto(req, res, next) {
  try {
    const { id_publicacion } = req.query;

    if (!esId(id_publicacion)) {
      return res.status(400).json({
        ok: false,
        error: 'El query param "id_publicacion" es obligatorio y numérico',
      });
    }

    const contacto = await obtenerContacto({
      id_usuario: req.usuario.id,
      id_publicacion: Number(id_publicacion),
    });

    return res.status(200).json({ ok: true, contacto });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/mis-publicaciones/interesados?id_publicacion= — HU-18
 * La ruta ya exige empresa; la empresa sale del token.
 */
export async function getInteresados(req, res, next) {
  try {
    const { id_publicacion } = req.query;

    if (id_publicacion !== undefined && !esId(id_publicacion)) {
      return res.status(400).json({ ok: false, error: 'id_publicacion debe ser numérico' });
    }

    const interesados = await listarInteresados(
      req.usuario.id_empresa,
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