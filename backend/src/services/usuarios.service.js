import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabaseClient.js';
import { deleteStorageFile } from './storage.service.js';

const SALT_ROUNDS = 10;

function errorHttp(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

function verificar({ error }, mensaje) {
  if (error) throw errorHttp(500, `${mensaje}: ${error.message}`);
}

export async function registrarUsuario({ email, password }) {
  const emailNormalizado = email.trim().toLowerCase();

  // 1. Verificar que el email no exista ya
  const { data: existente, error: errorBusqueda } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', emailNormalizado)
    .maybeSingle();

  if (errorBusqueda) throw errorHttp(500, 'Error al verificar el email en la base de datos');
  if (existente) throw errorHttp(409, 'El email ya está registrado');

  // 2. Hashear la contraseña
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Insertar el nuevo usuario
  const { data: nuevoUsuario, error: errorInsercion } = await supabase
    .from('usuarios')
    .insert([
      {
        email: emailNormalizado,
        password_hash,
        fecha_registro: new Date().toISOString(),
      },
    ])
    .select('id, email, fecha_registro') // nunca devolvemos el password_hash
    .single();

  if (errorInsercion) {
    // Carrera entre la verificación previa y el insert (uq_usuarios_email)
    if (errorInsercion.code === '23505') throw errorHttp(409, 'El email ya está registrado');
    throw errorHttp(500, 'Error al registrar el usuario: ' + errorInsercion.message);
  }

  return nuevoUsuario;
}

export async function loginUsuario({ email, password }) {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('id, email, password_hash, fecha_registro, suspendido')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (error) throw errorHttp(500, 'Error al verificar las credenciales');

  // Mensaje genérico a propósito: no revelar si fue el email o el password lo que falló
  if (!user) throw errorHttp(401, 'Correo o contraseña incorrectos');

  const passwordValida = await bcrypt.compare(password, user.password_hash);
  if (!passwordValida) throw errorHttp(401, 'Correo o contraseña incorrectos');

  // Se revisa DESPUÉS de la contraseña: solo el dueño real de la cuenta sabe que está suspendida
  if (user.suspendido === true) {
    const err = errorHttp(403, 'Tu cuenta está suspendida. Contacta al administrador');
    err.codigo = 'CUENTA_SUSPENDIDA';
    throw err;
  }

  // Buscar si el usuario tiene perfil de empresa o de persona, para devolverlo al front
  const [resEmpresa, resPersona] = await Promise.all([
    supabase
      .from('empresas')
      .select('id, nombre, id_municipio, id_rol')
      .eq('id_usuario', user.id)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('personas')
      .select('id, nombre, id_municipio, id_rol')
      .eq('id_usuario', user.id)
      .limit(1)
      .maybeSingle(),
  ]);
  if (resEmpresa.error || resPersona.error) throw errorHttp(500, 'Error al consultar el perfil del usuario');

  const empresa = resEmpresa.data;
  const persona = resPersona.data;

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
  // Borrado en cascada manual: no hay ON DELETE CASCADE en el esquema, el orden importa (FKs).
  const fotos = [];

  const resEmpresas = await supabase.from('empresas').select('id').eq('id_usuario', id);
  verificar(resEmpresas, 'Error al consultar las empresas del usuario');
  const idsEmpresas = resEmpresas.data.map((e) => e.id);

  if (idsEmpresas.length) {
    const resSubs = await supabase.from('subproductos').select('id, foto_url').in('id_empresa', idsEmpresas);
    verificar(resSubs, 'Error al consultar los subproductos');
    const idsSubs = resSubs.data.map((s) => s.id);
    resSubs.data.forEach((s) => s.foto_url && fotos.push(s.foto_url));

    if (idsSubs.length) {
      // intereses que otros usuarios manifestaron en las publicaciones de esta empresa
      verificar(
        await supabase.from('manifestaciones_interes').delete().in('id_publicacion', idsSubs),
        'Error al eliminar los intereses de sus publicaciones'
      );
      verificar(
        await supabase.from('subproductos').delete().in('id', idsSubs),
        'Error al eliminar los subproductos'
      );
    }
    verificar(await supabase.from('empresas').delete().in('id', idsEmpresas), 'Error al eliminar la empresa');
  }

  // intereses que este usuario manifestó en publicaciones de otros
  verificar(
    await supabase.from('manifestaciones_interes').delete().eq('id_usuario', id),
    'Error al eliminar los intereses del usuario'
  );
  verificar(await supabase.from('personas').delete().eq('id_usuario', id), 'Error al eliminar la persona');
  verificar(await supabase.from('usuarios').delete().eq('id', id), 'Error al eliminar el usuario');

  // Solo cuando la BD quedó limpia se borran las imágenes del Storage
  for (const url of fotos) await deleteStorageFile(url);
}

/**
 * Elimina un usuario si y solo si no tiene ninguna empresa ni persona asociada.
 * Útil para limpiar usuarios creados en el paso 1 del registro si el paso 2 falla.
 */
export async function eliminarUsuarioHuerfano(id) {
  if (!id) return false;
  const [{ data: empresa }, { data: persona }] = await Promise.all([
    supabase.from('empresas').select('id').eq('id_usuario', id).maybeSingle(),
    supabase.from('personas').select('id').eq('id_usuario', id).maybeSingle(),
  ]);

  if (!empresa && !persona) {
    await supabase.from('usuarios').delete().eq('id', id);
    return true;
  }
  return false;
}