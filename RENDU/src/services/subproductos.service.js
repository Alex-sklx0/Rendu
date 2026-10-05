import { supabase } from '../config/supabaseClient.js';

const MUNICIPIOS_VALIDOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Valle de Aburrá

// estados_publicacion confirmado en Supabase: 1=BORRADOR, 2=PUBLICADO
const ESTADO_BORRADOR = 1;
const ESTADO_PUBLICADO = 2;

const CAMPOS_SUBPRODUCTO =
  'id, id_empresa, nombre, descripcion, id_familia_material, volumen_disponible, id_unidad_medida, id_municipio, direccion, foto_url, fecha_registro, disponible, id_estado_publicacion';

export async function registrarSubproducto({
  id_empresa,
  nombre,
  id_familia_material,
  volumen_disponible,
  id_unidad_medida,
  descripcion,
  id_municipio,
  direccion,
  foto_url,
}) {
  // Verificar que la empresa exista
  const { data: empresaExiste, error: errorEmpresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('id', id_empresa)
    .maybeSingle();
  if (errorEmpresa) {
    const err = new Error('Error al verificar la empresa');
    err.status = 500;
    throw err;
  }
  if (!empresaExiste) {
    const err = new Error('La empresa indicada no existe');
    err.status = 404;
    throw err;
  }

  // Verificar que la familia de material exista
  const { data: familiaExiste, error: errorFamilia } = await supabase
    .from('familias_material')
    .select('id')
    .eq('id', id_familia_material)
    .maybeSingle();
  if (errorFamilia) {
    const err = new Error('Error al verificar la familia de material');
    err.status = 500;
    throw err;
  }
  if (!familiaExiste) {
    const err = new Error('La familia de material indicada no existe');
    err.status = 404;
    throw err;
  }

  // Verificar que la unidad de medida exista
  const { data: unidadExiste, error: errorUnidad } = await supabase
    .from('unidades_medida')
    .select('id')
    .eq('id', id_unidad_medida)
    .maybeSingle();
  if (errorUnidad) {
    const err = new Error('Error al verificar la unidad de medida');
    err.status = 500;
    throw err;
  }
  if (!unidadExiste) {
    const err = new Error('La unidad de medida indicada no existe');
    err.status = 404;
    throw err;
  }

  // Insertar el subproducto — nace en BORRADOR (HU-07); se publica con un endpoint aparte.
  const { data: nuevoSubproducto, error: errorInsercion } = await supabase
    .from('subproductos')
    .insert([
      {
        id_empresa,
        nombre,
        id_familia_material,
        volumen_disponible,
        id_unidad_medida,
        descripcion: descripcion || null,
        id_municipio,
        direccion: direccion || null,
        foto_url: foto_url || null,
        id_estado_publicacion: ESTADO_BORRADOR,
        fecha_registro: new Date().toISOString(),
      },
    ])
    .select(CAMPOS_SUBPRODUCTO)
    .single();

  if (errorInsercion) {
    // ck_subproductos_volumen: volumen_disponible debe ser > 0
    if (errorInsercion.code === '23514') {
      const err = new Error('El volumen disponible debe ser mayor que cero');
      err.status = 400;
      throw err;
    }
    const err = new Error('Error al registrar el subproducto: ' + errorInsercion.message);
    err.status = 500;
    throw err;
  }

  return nuevoSubproducto;
}

export async function obtenerSubproductoPorId(id) {
  const { data, error } = await supabase
    .from('subproductos')
    .select(CAMPOS_SUBPRODUCTO)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    const err = new Error('Error al consultar el subproducto');
    err.status = 500;
    throw err;
  }
  if (!data) {
    const err = new Error('Subproducto no encontrado');
    err.status = 404;
    throw err;
  }
  return data;
}

export async function listarMisPublicaciones(id_empresa) {
  const { data, error } = await supabase
    .from('subproductos')
    .select(CAMPOS_SUBPRODUCTO)
    .eq('id_empresa', id_empresa)
    .order('fecha_registro', { ascending: false });

  if (error) {
    const err = new Error('Error al listar las publicaciones');
    err.status = 500;
    throw err;
  }
  return data;
}

/**
 * Verifica que el subproducto exista y pertenezca a id_empresa.
 * Lanza 404 si no existe, 403 si existe pero es de otra empresa.
 *
 * NOTA (Sprint 2 - HU-11): esto confía en el id_empresa que manda el frontend
 * (guardado en localStorage tras login/registro). No es seguridad real contra
 * un cliente malicioso — solo evita que el front edite/borre por error un
 * subproducto ajeno. Reemplazar por validación vía token cuando exista JWT.
 */
async function verificarPropietario(id, id_empresa) {
  const { data, error } = await supabase
    .from('subproductos')
    .select('id_empresa')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    const err = new Error('Error al verificar el subproducto');
    err.status = 500;
    throw err;
  }
  if (!data) {
    const err = new Error('Subproducto no encontrado');
    err.status = 404;
    throw err;
  }
  if (Number(data.id_empresa) !== Number(id_empresa)) {
    const err = new Error('No tienes permiso sobre este subproducto');
    err.status = 403;
    throw err;
  }
}

export async function actualizarSubproducto(id, id_empresa, cambios) {
  await verificarPropietario(id, id_empresa);

  const CAMPOS_EDITABLES = ['nombre', 'descripcion', 'volumen_disponible', 'direccion', 'foto_url', 'disponible'];
  const datosLimpios = Object.fromEntries(
    Object.entries(cambios).filter(([key]) => CAMPOS_EDITABLES.includes(key))
  );

  const { data, error } = await supabase
    .from('subproductos')
    .update(datosLimpios)
    .eq('id', id)
    .select(CAMPOS_SUBPRODUCTO)
    .single();

  if (error) {
    if (error.code === '23514') {
      const err = new Error('El volumen disponible debe ser mayor que cero');
      err.status = 400;
      throw err;
    }
    const err = new Error('Error al actualizar el subproducto: ' + error.message);
    err.status = 500;
    throw err;
  }
  return data;
}

export async function eliminarSubproducto(id, id_empresa) {
  await verificarPropietario(id, id_empresa);

  const { data: producto } = await supabase.from('subproductos').select('foto_url').eq('id', id).maybeSingle();

  const { error } = await supabase.from('subproductos').delete().eq('id', id);
  if (error) {
    const err = new Error('Error al eliminar el subproducto: ' + error.message);
    err.status = 500;
    throw err;
  }

  return { foto_url: producto?.foto_url || null };
}

/**
 * HU-07: publicar o despublicar un subproducto.
 * @param {boolean} publicar - true = PUBLICADO, false = BORRADOR
 */
export async function cambiarEstadoPublicacion(id, id_empresa, publicar) {
  await verificarPropietario(id, id_empresa);

  const { data, error } = await supabase
    .from('subproductos')
    .update({ id_estado_publicacion: publicar ? ESTADO_PUBLICADO : ESTADO_BORRADOR })
    .eq('id', id)
    .select(CAMPOS_SUBPRODUCTO)
    .single();

  if (error) {
    const err = new Error('Error al cambiar el estado de publicación: ' + error.message);
    err.status = 500;
    throw err;
  }
  return data;
}

export { MUNICIPIOS_VALIDOS, ESTADO_BORRADOR, ESTADO_PUBLICADO };