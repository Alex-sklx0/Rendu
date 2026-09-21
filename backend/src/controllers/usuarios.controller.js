// Controlador para autenticacion y gestion de usuarios

import bcrypt from 'bcryptjs';
import { supabase } from '../config/db.js';

// Registrar un nuevo usuario
export async function registrarUsuario(req, res, next) {
  try {
    const { email, password } = req.body;
    
    // Validar correo y contraseña
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ ok: false, error: 'email y password son obligatorios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Insertar usuario con clave encriptada
    const { data, error } = await supabase
      .from('usuarios')
      .insert({ email: email.trim().toLowerCase(), password_hash: await bcrypt.hash(password, 10) })
      .select('id, email, fecha_registro')
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

// Iniciar sesion de usuario
export async function loginUsuario(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Correo y contraseña son obligatorios.' });
    }

    // Buscar usuario por correo
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id, email, password_hash, fecha_registro')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos.' });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos.' });
    }

    // Buscar si esta vinculado a una empresa o persona natural
    const [{ data: empresa }, { data: persona }] = await Promise.all([
      supabase.from('empresas').select('id, nombre, id_usuario').eq('id_usuario', user.id).maybeSingle(),
      supabase.from('personas').select('id, nombre, id_usuario').eq('id_usuario', user.id).maybeSingle(),
    ]);

    const userData = {
      id: user.id,
      email: user.email,
      nombre: empresa?.nombre || persona?.nombre || user.email.split('@')[0],
      id_empresa: empresa?.id || null,
    };

    return res.json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso',
      usuario: userData,
      empresa: empresa || null,
    });
  } catch (error) {
    return next(error);
  }
}

// Eliminar cuenta de usuario y sus datos asociados
export async function eliminarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    
    // Si tiene empresa, eliminar subproductos y la empresa
    const { data: empresa } = await supabase.from('empresas').select('id').eq('id_usuario', id).maybeSingle();
    if (empresa) {
      await supabase.from('subproductos').delete().eq('id_empresa', empresa.id);
      await supabase.from('empresas').delete().eq('id', empresa.id);
    }
    
    // Eliminar perfil de persona y usuario
    await supabase.from('personas').delete().eq('id_usuario', id);
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) throw error;
    return res.json({ ok: true, mensaje: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    return next(error);
  }
}
