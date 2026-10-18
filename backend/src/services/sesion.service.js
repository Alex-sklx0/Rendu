import { supabase } from '../config/supabaseClient.js';

function errorHttp(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

/**
 * Perfil completo de la sesión: usuario + empresa o persona (sin NIT ni cédula).
 */
export async function obtenerPerfil(id_usuario) {
  const [resUsuario, resEmpresa, resPersona] = await Promise.all([
    supabase.from('usuarios').select('id, email, fecha_registro').eq('id', id_usuario).maybeSingle(),
    supabase
      .from('empresas')
      .select('id, nombre, id_municipio, id_rol, contacto, id_medio_contacto, municipios ( nombre ), medios_contacto ( nombre )')
      .eq('id_usuario', id_usuario)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('personas')
      .select('id, nombre, id_municipio, id_rol, municipios ( nombre )')
      .eq('id_usuario', id_usuario)
      .limit(1)
      .maybeSingle(),
  ]);

  if (resUsuario.error || resEmpresa.error || resPersona.error) {
    throw errorHttp(500, 'Error al consultar el perfil');
  }
  if (!resUsuario.data) throw errorHttp(404, 'El usuario indicado no existe');

  const u = resUsuario.data;
  const e = resEmpresa.data;
  const p = resPersona.data;

  const empresa = e
    ? {
        id: e.id,
        nombre: e.nombre,
        id_municipio: e.id_municipio,
        municipio: e.municipios?.nombre ?? null,
        id_rol: e.id_rol,
        contacto: e.contacto ?? null,
        id_medio_contacto: e.id_medio_contacto ?? null,
        medio_contacto: e.medios_contacto?.nombre ?? null,
      }
    : null;

  const persona = p
    ? {
        id: p.id,
        nombre: p.nombre,
        id_municipio: p.id_municipio,
        municipio: p.municipios?.nombre ?? null,
        id_rol: p.id_rol,
      }
    : null;

  return {
    usuario: {
      id: u.id,
      email: u.email,
      fecha_registro: u.fecha_registro,
      nombre: empresa?.nombre || persona?.nombre || u.email.split('@')[0],
      id_empresa: empresa?.id ?? null,
    },
    tipo: empresa ? 'EMPRESA' : persona ? 'PERSONA' : null,
    empresa,
    persona,
  };
}

/**
 * Con sesión, agrega a cada publicación:
 *   ya_manifeste_interes (boolean) y es_mia (boolean).
 * Sin sesión, devuelve las publicaciones sin cambios.
 */
export async function anotarPublicaciones(publicaciones, usuario) {
  if (!usuario || !publicaciones.length) return publicaciones;

  const ids = publicaciones.map((p) => p.id);
  const { data, error } = await supabase
    .from('manifestaciones_interes')
    .select('id_publicacion')
    .eq('id_usuario', usuario.id)
    .in('id_publicacion', ids);

  if (error) throw errorHttp(500, 'Error al consultar tus intereses: ' + error.message);

  const conInteres = new Set(data.map((m) => Number(m.id_publicacion)));

  return publicaciones.map((p) => ({
    ...p,
    ya_manifeste_interes: conInteres.has(Number(p.id)),
    es_mia: usuario.id_empresa != null && Number(p.id_empresa) === usuario.id_empresa,
  }));
}