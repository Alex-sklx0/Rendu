import { supabase } from '../config/supabaseClient.js';
import { esAdmin } from '../middlewares/auth.js';

function errorHttp(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

function verificar({ error }, mensaje) {
  if (error) throw errorHttp(500, mensaje);
}

/**
 * Lista de usuarios para el panel admin. Nunca incluye password_hash.
 * Incluye NIT y cédula porque la matriz de roles da al admin la vista completa del perfil.
 */
export async function listarUsuarios() {
  const [resU, resE, resP] = await Promise.all([
    supabase
      .from('usuarios')
      .select('id, email, fecha_registro, suspendido')
      .order('fecha_registro', { ascending: false }),
    supabase.from('empresas').select('id, id_usuario, nombre, nit, id_rol, municipios ( nombre )'),
    supabase.from('personas').select('id, id_usuario, nombre, cedula, id_rol, municipios ( nombre )'),
  ]);
  verificar(resU, 'Error al consultar los usuarios');
  verificar(resE, 'Error al consultar las empresas');
  verificar(resP, 'Error al consultar las personas');

  const empresas = new Map(resE.data.map((e) => [e.id_usuario, e]));
  const personas = new Map(resP.data.map((p) => [p.id_usuario, p]));

  return resU.data.map((u) => {
    const e = empresas.get(u.id);
    const p = personas.get(u.id);
    return {
      id: u.id,
      email: u.email,
      fecha_registro: u.fecha_registro,
      es_admin: esAdmin(u.id),
      suspendido: u.suspendido === true,
      tipo: e ? 'EMPRESA' : p ? 'PERSONA' : null,
      nombre: e?.nombre ?? p?.nombre ?? null,
      documento: e?.nit ?? p?.cedula ?? null,
      id_rol: e?.id_rol ?? p?.id_rol ?? null,
      municipio: (e ?? p)?.municipios?.nombre ?? null,
      id_empresa: e?.id ?? null,
    };
  });
}

/** Suspende o reactiva una cuenta. Solo actualiza la columna: nunca borra registros. */
export async function cambiarSuspension(id, suspendido) {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ suspendido })
    .eq('id', id)
    .select('id, email, suspendido')
    .maybeSingle();

  if (error) throw errorHttp(500, 'Error al actualizar el estado del usuario');
  if (!data) throw errorHttp(404, 'Usuario no encontrado');
  return data;
}