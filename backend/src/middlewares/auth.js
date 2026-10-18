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

// El token solo guarda el id del usuario; la empresa se consulta en cada petición
// para que nunca quede desactualizada (ej. usuario que registra su empresa después de iniciar sesión).
export function firmarToken({ id }) {
  return jwt.sign({ id }, obtenerSecreto(), { expiresIn: '8h' });
}

/**
 * Si llega "Authorization: Bearer <token>", lo valida y deja
 * req.usuario = { id, id_empresa } (id_empresa es null si no tiene empresa).
 * Si no llega, continúa sin req.usuario (modo compatible con el frontend actual).
 * Si llega y es inválido o vencido, responde 401.
 */
export async function autenticarOpcional(req, res, next) {
  try {
    const header = req.headers.authorization ?? '';
    if (!header.startsWith('Bearer ')) return next();

    let payload;
    try {
      payload = jwt.verify(header.slice(7), obtenerSecreto());
    } catch (error) {
      if (error.status) throw error;
      return res.status(401).json({ ok: false, error: 'Token inválido o vencido. Inicia sesión de nuevo' });
    }

    const id = Number(payload.id);

    const [resUsuario, resEmpresa] = await Promise.all([
      supabase.from('usuarios').select('id').eq('id', id).maybeSingle(),
      supabase.from('empresas').select('id').eq('id_usuario', id).limit(1).maybeSingle(),
    ]);

    if (resUsuario.error || resEmpresa.error) throw errorHttp(500, 'Error al validar la sesión');
    if (!resUsuario.data) {
      return res.status(401).json({ ok: false, error: 'La sesión ya no es válida. Inicia sesión de nuevo' });
    }

    req.usuario = { id, id_empresa: resEmpresa.data?.id ? Number(resEmpresa.data.id) : null };
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

/**
 * Con token: devuelve la empresa del token (403 si no tiene o si el cliente manda otra).
 * Sin token: devuelve el valor que mandó el cliente (modo compatible).
 */
export function resolverIdEmpresa(req, valorCliente) {
  if (!req.usuario) return valorCliente;

  if (!req.usuario.id_empresa) throw errorHttp(403, 'Tu cuenta no tiene una empresa asociada');

  const enviado = valorCliente !== undefined && valorCliente !== null && valorCliente !== '';
  if (enviado && Number(valorCliente) !== req.usuario.id_empresa) {
    throw errorHttp(403, 'No tienes permiso para actuar en nombre de otra empresa');
  }
  return req.usuario.id_empresa;
}

/**
 * Con token: devuelve el id del usuario del token (403 si el cliente manda otro).
 * Sin token: devuelve el valor que mandó el cliente (modo compatible).
 */
export function resolverIdUsuario(req, valorCliente) {
  if (!req.usuario) return valorCliente;

  const enviado = valorCliente !== undefined && valorCliente !== null && valorCliente !== '';
  if (enviado && Number(valorCliente) !== req.usuario.id) {
    throw errorHttp(403, 'No puedes actuar en nombre de otro usuario');
  }
  return req.usuario.id;
}