import { supabase } from '../config/supabaseClient.js';

const MUNICIPIOS_VALIDOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Valle de Aburrá
const ROLES_VALIDOS_PERSONA = [2, 3]; // 2=TRANSFORMADOR, 3=RECICLADOR (ck_personas_rol en la BD)

function errorHttp(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

export async function registrarPersona({ nombre, cedula, id_municipio, id_rol, id_usuario }) {
  // Verificar que el usuario exista
  const { data: usuarioExiste, error: errorUsuario } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', id_usuario)
    .maybeSingle();
  if (errorUsuario) throw errorHttp(500, 'Error al verificar el usuario');
  if (!usuarioExiste) throw errorHttp(404, 'El usuario indicado no existe');

  // Un usuario tiene un solo perfil de persona
  const { data: yaTiene, error: errorYaTiene } = await supabase
    .from('personas')
    .select('id')
    .eq('id_usuario', id_usuario)
    .limit(1)
    .maybeSingle();
  if (errorYaTiene) throw errorHttp(500, 'Error al verificar el perfil del usuario');
  if (yaTiene) throw errorHttp(409, 'Este usuario ya tiene un perfil de persona registrado');

  // Verificar que la cédula no esté ya registrada (uq_personas_cedula en la BD)
  const { data: cedulaExiste, error: errorCedula } = await supabase
    .from('personas')
    .select('id')
    .eq('cedula', cedula)
    .maybeSingle();
  if (errorCedula) throw errorHttp(500, 'Error al verificar la cédula');
  if (cedulaExiste) throw errorHttp(409, 'Ya existe una persona registrada con esa cédula');

  // Insertar la persona
  const { data: nuevaPersona, error: errorInsercion } = await supabase
    .from('personas')
    .insert([{ nombre, cedula, id_municipio, id_rol, id_usuario }])
    .select('id, nombre, cedula, id_municipio, id_rol, id_usuario')
    .single();

  if (errorInsercion) {
    if (errorInsercion.code === '23505') {
      throw errorHttp(409, 'Ya existe una persona registrada con esa cédula');
    }
    throw errorHttp(500, 'Error al registrar la persona: ' + errorInsercion.message);
  }

  return nuevaPersona;
}

export async function actualizarPersona(id_persona, cambios) {
  const CAMPOS_PERMITIDOS = ['nombre', 'cedula', 'id_municipio', 'id_rol'];
  const datosLimpios = Object.fromEntries(
    Object.entries(cambios).filter(([k, v]) => CAMPOS_PERMITIDOS.includes(k) && v !== undefined)
  );

  if (datosLimpios.cedula) {
    const { data: cedulaExiste } = await supabase
      .from('personas')
      .select('id')
      .eq('cedula', datosLimpios.cedula)
      .neq('id', id_persona)
      .maybeSingle();

    if (cedulaExiste) {
      throw errorHttp(409, 'Ya existe otra persona registrada con esa cédula');
    }
  }

  const { data, error } = await supabase
    .from('personas')
    .update(datosLimpios)
    .eq('id', id_persona)
    .select('id, nombre, cedula, id_municipio, id_rol, id_usuario')
    .single();

  if (error) {
    throw errorHttp(500, 'Error al actualizar la persona: ' + error.message);
  }
  return data;
}

export { MUNICIPIOS_VALIDOS, ROLES_VALIDOS_PERSONA };