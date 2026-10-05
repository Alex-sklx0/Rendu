import { registrarUsuario, loginUsuario, eliminarUsuario } from '../services/usuarios.service.js';

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

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado exitosamente',
      usuario,
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

    return res.status(200).json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso',
      ...resultado,
    });
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

    await eliminarUsuario(Number(id));

    return res.status(200).json({ ok: true, mensaje: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
}