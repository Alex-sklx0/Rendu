import { supabase } from '../config/supabaseClient.js';

const MUNICIPIOS_VALIDOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Valle de Aburrá
const ROLES_VALIDOS_EMPRESA = [1, 2]; // 1=GENERADOR, 2=TRANSFORMADOR (ck_empresas_rol en la BD)

function errorHttp(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

export async function registrarEmpresa({
  nombre,
  nit,
  id_municipio,
  id_rol,
  id_usuario,
  contacto = null,
  id_medio_contacto = null,
}) {
  // Verificar que el usuario exista
  const { data: usuarioExiste, error: errorUsuario } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', id_usuario)
    .maybeSingle();
  if (errorUsuario) throw errorHttp(500, 'Error al verificar el usuario');
  if (!usuarioExiste) throw errorHttp(404, 'El usuario indicado no existe');

  // Un usuario tiene una sola empresa
  const { data: yaTiene, error: errorYaTiene } = await supabase
    .from('empresas')
    .select('id')
    .eq('id_usuario', id_usuario)
    .limit(1)
    .maybeSingle();
  if (errorYaTiene) throw errorHttp(500, 'Error al verificar la empresa del usuario');
  if (yaTiene) throw errorHttp(409, 'Este usuario ya tiene una empresa registrada');

  // Verificar que el medio de contacto exista (si se envió)
  if (id_medio_contacto !== null) {
    const { data: medioExiste, error: errorMedio } = await supabase
      .from('medios_contacto')
      .select('id')
      .eq('id', id_medio_contacto)
      .maybeSingle();
    if (errorMedio) throw errorHttp(500, 'Error al verificar el medio de contacto');
    if (!medioExiste) throw errorHttp(404, 'El medio de contacto indicado no existe');
  }

  // Verificar que el NIT no esté ya registrado (uq_empresas_nit en la BD)
  const { data: nitExiste, error: errorNit } = await supabase
    .from('empresas')
    .select('id')
    .eq('nit', nit)
    .maybeSingle();
  if (errorNit) throw errorHttp(500, 'Error al verificar el NIT');
  if (nitExiste) throw errorHttp(409, 'Ya existe una empresa registrada con ese NIT');

  // Insertar la empresa
  const { data: nuevaEmpresa, error: errorInsercion } = await supabase
    .from('empresas')
    .insert([{ nombre, nit, id_municipio, id_rol, id_usuario, contacto, id_medio_contacto }])
    .select('id, nombre, nit, id_municipio, id_rol, id_usuario, contacto, id_medio_contacto')
    .single();

  if (errorInsercion) {
    if (errorInsercion.code === '23505') {
      throw errorHttp(409, 'Ya existe una empresa registrada con ese NIT');
    }
    throw errorHttp(500, 'Error al registrar la empresa: ' + errorInsercion.message);
  }

  return nuevaEmpresa;
}

export async function actualizarContactoEmpresa(id_empresa, { contacto, id_medio_contacto }) {
  const { data, error } = await supabase
    .from('empresas')
    .update({ contacto, id_medio_contacto })
    .eq('id', id_empresa)
    .select('id, nombre, nit, id_municipio, id_rol, id_usuario, contacto, id_medio_contacto')
    .single();

  if (error) {
    throw errorHttp(500, 'Error al actualizar el contacto: ' + error.message);
  }
  return data;
}

export async function actualizarEmpresa(id_empresa, cambios) {
  const CAMPOS_PERMITIDOS = ['nombre', 'nit', 'id_municipio', 'id_rol', 'contacto', 'id_medio_contacto'];
  const datosLimpios = Object.fromEntries(
    Object.entries(cambios).filter(([k, v]) => CAMPOS_PERMITIDOS.includes(k) && v !== undefined)
  );

  if (datosLimpios.nit) {
    const { data: nitExiste } = await supabase
      .from('empresas')
      .select('id')
      .eq('nit', datosLimpios.nit)
      .neq('id', id_empresa)
      .maybeSingle();

    if (nitExiste) {
      throw errorHttp(409, 'Ya existe otra empresa registrada con ese NIT');
    }
  }

  const { data, error } = await supabase
    .from('empresas')
    .update(datosLimpios)
    .eq('id', id_empresa)
    .select('id, nombre, nit, id_municipio, id_rol, id_usuario, contacto, id_medio_contacto')
    .single();

  if (error) {
    throw errorHttp(500, 'Error al actualizar la empresa: ' + error.message);
  }
  return data;
}

export { MUNICIPIOS_VALIDOS, ROLES_VALIDOS_EMPRESA };