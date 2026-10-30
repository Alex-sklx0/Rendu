import { registrarUsuario, loginUsuario, eliminarUsuario } from '../services/usuarios.service.js';
import { obtenerPerfil } from '../services/sesion.service.js';
import { firmarToken, esAdmin } from '../middlewares/auth.js';
import { uploadImageToStorage } from '../services/storage.service.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function postRegistrarUsuario(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Los campos "email" y "password" son obligatorios',
      });
    }

    if (email.length > 254 || !EMAIL_REGEX.test(email.trim())) {
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

    // bcrypt ignora todo lo que pase de 72 bytes
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({
        ok: false,
        error: 'La contraseña es demasiado larga (máximo 72 caracteres)',
      });
    }

    const usuario = await registrarUsuario({ email, password });
    // Token desde el registro: permite crear la empresa/persona ya con sesión
    const token = firmarToken({ id: usuario.id });

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado exitosamente',
      usuario: { ...usuario, es_admin: esAdmin(usuario.id) },
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function postLoginUsuario(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
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
      usuario: { ...resultado.usuario, es_admin: esAdmin(resultado.usuario.id) },
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
    perfil.usuario.es_admin = req.usuario.es_admin;
    return res.status(200).json({ ok: true, ...perfil });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/usuarios/:id — solo la propia cuenta (el id ya lo valida router.param)
export async function deleteUsuario(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (req.usuario.id !== id) {
      return res.status(403).json({ ok: false, error: 'Solo puedes eliminar tu propia cuenta' });
    }

    await eliminarUsuario(id);

    return res.status(200).json({ ok: true, mensaje: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
}

// POST /api/usuarios/avatar — sube o actualiza foto de perfil
export async function postSubirAvatar(req, res, next) {
  try {
    const { image_base64, previous_url } = req.body ?? {};
    if (!image_base64) {
      return res.status(400).json({ ok: false, error: 'Se requiere la imagen en base64' });
    }

    const publicUrl = await uploadImageToStorage(image_base64, 'avatars', previous_url || null);
    return res.status(200).json({
      ok: true,
      mensaje: 'Avatar actualizado exitosamente',
      avatar_url: publicUrl,
    });
  } catch (error) {
    next(error);
  }
}