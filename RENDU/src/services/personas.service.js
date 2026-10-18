import { supabase } from '../config/supabaseClient.js';

const MUNICIPIOS_VALIDOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Valle de Aburrá
const ROLES_VALIDOS_PERSONA = [2, 3]; // 2=TRANSFORMADOR, 3=RECICLADOR (ck_personas_rol en la BD)

export async function registrarPersona({ nombre, cedula, id_municipio, id_rol, id_usuario }) {
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

  // Verificar que la cédula no esté ya registrada (uq_personas_cedula en la BD)
  const { data: cedulaExiste, error: errorCedula } = await supabase
    .from('personas')
    .select('id')
    .eq('cedula', cedula)
    .maybeSingle();

  if (errorCedula) {
    const err = new Error('Error al verificar la cédula');
    err.status = 500;
    throw err;
  }

  if (cedulaExiste) {
    const err = new Error('Ya existe una persona registrada con esa cédula');
    err.status = 409;
    throw err;
  }

  // Insertar la persona
  const { data: nuevaPersona, error: errorInsercion } = await supabase
    .from('personas')
    .insert([{ nombre, cedula, id_municipio, id_rol, id_usuario }])
    .select('id, nombre, cedula, id_municipio, id_rol, id_usuario')
    .single();

  if (errorInsercion) {
    const err = new Error('Error al registrar la persona: ' + errorInsercion.message);
    err.status = 500;
    throw err;
  }

  return nuevaPersona;
}

export { MUNICIPIOS_VALIDOS, ROLES_VALIDOS_PERSONA };