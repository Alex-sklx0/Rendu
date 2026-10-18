import { registrarUsuario, loginUsuario, eliminarUsuario } from '../services/usuarios.service.js';
import { obtenerPerfil } from '../services/sesion.service.js';
import { firmarToken } from '../middlewares/auth.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function postRegistrarUsuario(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Los campos "email" y "password" son obligatorios',
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        ok: false,
        error: 'El formato del email no es válido',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        error: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    const usuario = await registrarUsuario({ email, password });
    // Token desde el registro: permite crear la empresa/persona ya con sesión
    const token = firmarToken({ id: usuario.id });

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado exitosamente',
      usuario,
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function postLoginUsuario(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Los campos "email" y "password" son obligatorios',
      });
    }

    const resultado = await loginUsuario({ email, password });
    const token = firmarToken({ id: resultado.usuario.id });

    return res.status(200).json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso',
      ...resultado,
      token,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/usuarios/me — perfil de la sesión actual (requiere token)
export async function getMe(req, res, next) {
  try {
    const perfil = await obtenerPerfil(req.usuario.id);
    return res.status(200).json({ ok: true, ...perfil });
  } catch (error) {
    next(error);
  }
}

export async function deleteUsuario(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || !/^\d+$/.test(String(id))) {
      return res.status(400).json({ ok: false, error: 'id de usuario inválido' });
    }

    if (req.usuario && req.usuario.id !== Number(id)) {
      return res.status(403).json({ ok: false, error: 'Solo puedes eliminar tu propia cuenta' });
    }

    await eliminarUsuario(Number(id));

    return res.status(200).json({ ok: true, mensaje: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
}