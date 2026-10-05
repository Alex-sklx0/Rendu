import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabaseClient.js';

const SALT_ROUNDS = 10;

export async function registrarUsuario({ email, password }) {
  // 1. Verificar que el email no exista ya
  const { data: existente, error: errorBusqueda } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (errorBusqueda) {
    const err = new Error('Error al verificar el email en la base de datos');
    err.status = 500;
    throw err;
  }

  if (existente) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  // 2. Hashear la contraseña
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Insertar el nuevo usuario
  const { data: nuevoUsuario, error: errorInsercion } = await supabase
    .from('usuarios')
    .insert([
      {
        email: email.trim().toLowerCase(),
        password_hash,
        fecha_registro: new Date().toISOString(),
      },
    ])
    .select('id, email, fecha_registro') // nunca devolvemos el password_hash
    .single();

  if (errorInsercion) {
    const err = new Error('Error al registrar el usuario: ' + errorInsercion.message);
    err.status = 500;
    throw err;
  }

  return nuevoUsuario;
}

export async function loginUsuario({ email, password }) {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('id, email, password_hash, fecha_registro')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    const err = new Error('Error al verificar las credenciales');
    err.status = 500;
    throw err;
  }

  // Mensaje genérico a propósito: no revelar si fue el email o el password lo que falló
  if (!user) {
    const err = new Error('Correo o contraseña incorrectos');
    err.status = 401;
    throw err;
  }

  const passwordValida = await bcrypt.compare(password, user.password_hash);
  if (!passwordValida) {
    const err = new Error('Correo o contraseña incorrectos');
    err.status = 401;
    throw err;
  }

  // Buscar si el usuario tiene perfil de empresa o de persona, para devolverlo al front
  const [{ data: empresa }, { data: persona }] = await Promise.all([
    supabase.from('empresas').select('id, nombre, id_municipio, id_rol').eq('id_usuario', user.id).maybeSingle(),
    supabase.from('personas').select('id, nombre, id_municipio, id_rol').eq('id_usuario', user.id).maybeSingle(),
  ]);

  return {
    usuario: {
      id: user.id,
      email: user.email,
      fecha_registro: user.fecha_registro,
      nombre: empresa?.nombre || persona?.nombre || user.email.split('@')[0],
      id_empresa: empresa?.id || null,
    },
    empresa: empresa || null,
    persona: persona || null,
  };
}

export async function eliminarUsuario(id) {
  // Borra en cascada manual: subproductos de la empresa del usuario, la empresa, la persona, y el usuario.
  // NOTA: no hay ON DELETE CASCADE en el esquema, así que el orden importa (FKs).
  const { data: empresa } = await supabase.from('empresas').select('id').eq('id_usuario', id).maybeSingle();
  if (empresa) {
    await supabase.from('subproductos').delete().eq('id_empresa', empresa.id);
    await supabase.from('empresas').delete().eq('id', empresa.id);
  }
  await supabase.from('personas').delete().eq('id_usuario', id);

  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) {
    const err = new Error('Error al eliminar el usuario: ' + error.message);
    err.status = 500;
    throw err;
  }
}