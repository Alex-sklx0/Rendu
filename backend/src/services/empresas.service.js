// Servicio para empresas — registro y validaciones

import { supabase } from '../config/supabaseClient.js';

const MUNICIPIOS_VALIDOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Valle de Aburrá
const ROLES_VALIDOS_EMPRESA = [1, 2]; // 1=GENERADOR, 2=TRANSFORMADOR

export async function registrarEmpresa({ nombre, nit, id_municipio, id_rol, id_usuario }) {
  // Verificar que el usuario exista
  const { data: usuarioExiste, error: errorUsuario } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', id_usuario)
    .maybeSingle();

  if (errorUsuario) {
    const err = new Error('Error al verificar el usuario');
    err.status = 500;
    throw err;
  }

  if (!usuarioExiste) {
    const err = new Error('El usuario indicado no existe');
    err.status = 404;
    throw err;
  }

  // Verificar que el NIT no esté ya registrado
  const nitNormalizado = String(nit).trim().replace(/[.\s]/g, '');
  const { data: nitExiste, error: errorNit } = await supabase
    .from('empresas')
    .select('id')
    .eq('nit', nitNormalizado)
    .maybeSingle();

  if (errorNit) {
    const err = new Error('Error al verificar el NIT');
    err.status = 500;
    throw err;
  }

  if (nitExiste) {
    const err = new Error('Ya existe una empresa registrada con ese NIT');
    err.status = 409;
    throw err;
  }

  const { data: nuevaEmpresa, error: errorInsercion } = await supabase
    .from('empresas')
    .insert([{ nombre, nit: nitNormalizado, id_municipio, id_rol, id_usuario }])
    .select('id, nombre, nit, id_municipio, id_rol, id_usuario')
    .single();

  if (errorInsercion) {
    const err = new Error('Error al registrar la empresa: ' + errorInsercion.message);
    err.status = 500;
    throw err;
  }

  return nuevaEmpresa;
}

export { MUNICIPIOS_VALIDOS, ROLES_VALIDOS_EMPRESA };
