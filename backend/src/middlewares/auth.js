import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';

function errorHttp(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

function obtenerSecreto() {
  if (!process.env.JWT_SECRET) throw errorHttp(500, 'Falta JWT_SECRET en el archivo .env');
  return process.env.JWT_SECRET;
}

// Administradores definidos en el .env: ADMIN_USER_IDS=61 (varios: 61,70)
// Se lee al usarla (no al cargar el módulo) para no depender del orden de carga de dotenv.
function obtenerAdminIds() {
  return new Set(
    (process.env.ADMIN_USER_IDS ?? '')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0)
  );
}

export const esAdmin = (id) => obtenerAdminIds().has(Number(id));

// El token solo guarda el id del usuario; empresa, rol de admin y suspensión se consultan
// en cada petición para que nunca queden desactualizados ni se puedan falsificar.
export function firmarToken({ id }) {
  return jwt.sign({ id }, obtenerSecreto(), { algorithm: 'HS256', expiresIn: '8h' });
}

/**
 * Si llega "Authorization: Bearer <token>", lo valida y deja
 * req.usuario = { id, id_empresa, es_admin } (id_empresa es null si no tiene empresa).
 * Si no llega, continúa sin req.usuario: las rutas privadas deben usar requerirAuth.
 * Si llega y es inválido o vencido, responde 401. Si la cuenta está suspendida, 403.
 */
export async function autenticarOpcional(req, res, next) {
  try {
    const header = req.headers.authorization ?? '';
    if (!header.startsWith('Bearer ')) return next();

    let payload;
    try {
      payload = jwt.verify(header.slice(7), obtenerSecreto(), { algorithms: ['HS256'] });
    } catch (error) {
      if (error.status) throw error;
      return res.status(401).json({ ok: false, error: 'Token inválido o vencido. Inicia sesión de nuevo' });
    }

    const id = Number(payload.id);
    if (!Number.isInteger(id)) {
      return res.status(401).json({ ok: false, error: 'Token inválido. Inicia sesión de nuevo' });
    }

    const [resUsuario, resEmpresa] = await Promise.all([
      supabase.from('usuarios').select('id, suspendido').eq('id', id).maybeSingle(),
      supabase.from('empresas').select('id').eq('id_usuario', id).limit(1).maybeSingle(),
    ]);

    if (resUsuario.error || resEmpresa.error) throw errorHttp(500, 'Error al validar la sesión');
    if (!resUsuario.data) {
      return res.status(401).json({ ok: false, error: 'La sesión ya no es válida. Inicia sesión de nuevo' });
    }
    if (resUsuario.data.suspendido === true) {
      return res.status(403).json({
        ok: false,
        codigo: 'CUENTA_SUSPENDIDA',
        error: 'Tu cuenta está suspendida. Contacta al administrador',
      });
    }

    req.usuario = {
      id,
      id_empresa: resEmpresa.data?.id ? Number(resEmpresa.data.id) : null,
      es_admin: esAdmin(id),
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

/** Exige sesión: usar después de autenticarOpcional. */
export function requerirAuth(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({ ok: false, error: 'Debes iniciar sesión (envía Authorization: Bearer <token>)' });
  }
  return next();
}

/** Exige sesión con empresa asociada. */
export function requerirEmpresa(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({ ok: false, error: 'Debes iniciar sesión (envía Authorization: Bearer <token>)' });
  }
  if (!req.usuario.id_empresa) {
    return res.status(403).json({ ok: false, error: 'Tu cuenta no tiene una empresa asociada' });
  }
  return next();
}

/** Exige administrador (definido en el servidor, nunca por lo que mande el cliente). */
export function requerirAdmin(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({ ok: false, error: 'Debes iniciar sesión (envía Authorization: Bearer <token>)' });
  }
  if (!req.usuario.es_admin) {
    return res.status(403).json({ ok: false, error: 'Se requieren permisos de administrador' });
  }
  return next();
}

/**
 * Devuelve la empresa de la sesión. 401 sin sesión, 403 si no tiene empresa
 * o si el cliente manda el id de otra.
 */
export function resolverIdEmpresa(req, valorCliente) {
  if (!req.usuario) throw errorHttp(401, 'Debes iniciar sesión');
  if (req.usuario.es_admin && valorCliente !== undefined && valorCliente !== null && valorCliente !== '') {
    return Number(valorCliente);
  }
  if (!req.usuario.id_empresa) throw errorHttp(403, 'Tu cuenta no tiene una empresa asociada');

  const enviado = valorCliente !== undefined && valorCliente !== null && valorCliente !== '';
  if (enviado && Number(valorCliente) !== req.usuario.id_empresa) {
    throw errorHttp(403, 'No tienes permiso para actuar en nombre de otra empresa');
  }
  return req.usuario.id_empresa;
}

/** Devuelve el id del usuario de la sesión. 401 sin sesión, 403 si el cliente manda otro. */
export function resolverIdUsuario(req, valorCliente) {
  if (!req.usuario) throw errorHttp(401, 'Debes iniciar sesión');
  if (req.usuario.es_admin && valorCliente !== undefined && valorCliente !== null && valorCliente !== '') {
    return Number(valorCliente);
  }

  const enviado = valorCliente !== undefined && valorCliente !== null && valorCliente !== '';
  if (enviado && Number(valorCliente) !== req.usuario.id) {
    throw errorHttp(403, 'No puedes actuar en nombre de otro usuario');
  }
  return req.usuario.id;
}