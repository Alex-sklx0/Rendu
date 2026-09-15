/**
 * Controlador de usuarios (migrado de auth-service)
 * TODO (Carolina): implementar lógica real siguiendo /docs/api-contract.md
 *
 * POST /api/usuarios
 * Request:  { email: string, password: string }
 * Response: { id, email, rol, fecha_registro }
 */

import bcrypt from 'bcryptjs';
import { supabase } from '../config/db.js';

export async function registrarUsuario(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ ok: false, error: 'email y password son obligatorios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert({ email: email.trim().toLowerCase(), password_hash: await bcrypt.hash(password, 10) })
      .select('id, email, rol, fecha_registro')
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ ok: false, error: 'El email ya está registrado.' });
      throw error;
    }
    return res.status(201).json({ ok: true, mensaje: 'Usuario registrado exitosamente', usuario: data });
  } catch (error) {
    return next(error);
  }
}
