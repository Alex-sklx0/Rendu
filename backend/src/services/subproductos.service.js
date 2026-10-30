import { supabase } from '../config/supabaseClient.js';

const MUNICIPIOS_VALIDOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Valle de Aburrá

// estados_publicacion confirmado en Supabase: 1=BORRADOR, 2=PUBLICADO
const ESTADO_BORRADOR = 1;
const ESTADO_PUBLICADO = 2;

const CAMPOS_SUBPRODUCTO =
  'id, id_empresa, nombre, descripcion, id_familia_material, volumen_disponible, id_unidad_medida, id_municipio, direccion, foto_url, fecha_registro, disponible, id_estado_publicacion';

// id, id_empresa y fecha_registro quedan protegidos (también por trigger en la BD)
const CAMPOS_EDITABLES = [
  'nombre',
  'descripcion',
  'volumen_disponible',
  'direccion',
  'foto_url',
  'disponible',
  'id_familia_material',
  'id_unidad_medida',
  'id_municipio',
];

function errorHttp(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

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
  if (errorEmpresa) throw errorHttp(500, 'Error al verificar la empresa');
  if (!empresaExiste) throw errorHttp(404, 'La empresa indicada no existe');

  // Verificar que la familia de material exista
  const { data: familiaExiste, error: errorFamilia } = await supabase
    .from('familias_material')
    .select('id')
    .eq('id', id_familia_material)
    .maybeSingle();
  if (errorFamilia) throw errorHttp(500, 'Error al verificar la familia de material');
  if (!familiaExiste) throw errorHttp(404, 'La familia de material indicada no existe');

  // Verificar que la unidad de medida exista
  const { data: unidadExiste, error: errorUnidad } = await supabase
    .from('unidades_medida')
    .select('id')
    .eq('id', id_unidad_medida)
    .maybeSingle();
  if (errorUnidad) throw errorHttp(500, 'Error al verificar la unidad de medida');
  if (!unidadExiste) throw errorHttp(404, 'La unidad de medida indicada no existe');

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
    if (errorInsercion.code === '23514') throw errorHttp(400, 'El volumen disponible debe ser mayor que cero');
    throw errorHttp(500, 'Error al registrar el subproducto: ' + errorInsercion.message);
  }

  return nuevoSubproducto;
}

export async function obtenerSubproductoPorId(id) {
  const { data, error } = await supabase
    .from('subproductos')
    .select(CAMPOS_SUBPRODUCTO)
    .eq('id', id)
    .maybeSingle();

  if (error) throw errorHttp(500, 'Error al consultar el subproducto');
  if (!data) throw errorHttp(404, 'Subproducto no encontrado');
  return data;
}

export async function listarMisPublicaciones(id_empresa) {
  const { data, error } = await supabase
    .from('subproductos')
    .select(CAMPOS_SUBPRODUCTO)
    .eq('id_empresa', id_empresa)
    .order('fecha_registro', { ascending: false });

  if (error) throw errorHttp(500, 'Error al listar las publicaciones');
  return data;
}

/**
 * Panel admin: todas las publicaciones (borradores y no disponibles incluidos),
 * con nombres legibles de empresa, familia y municipio.
 */
export async function listarTodosSubproductos(estado = null) {
  let query = supabase
    .from('subproductos')
    .select(`${CAMPOS_SUBPRODUCTO}, empresas ( nombre ), familias_material ( nombre ), municipios ( nombre )`);
  if (estado !== null) query = query.eq('id_estado_publicacion', estado);

  const { data, error } = await query.order('fecha_registro', { ascending: false });
  if (error) throw errorHttp(500, 'Error al listar los subproductos');

  return (data ?? []).map(({ empresas, familias_material, municipios, ...base }) => ({
    ...base,
    empresa: empresas?.nombre ?? null,
    familia: familias_material?.nombre ?? null,
    municipio: municipios?.nombre ?? null,
  }));
}

/**
 * Verifica que el subproducto exista y pertenezca a id_empresa.
 * Lanza 404 si no existe, 403 si existe pero es de otra empresa.
 * Un admin (opciones.esAdmin) se salta solo el chequeo de dueño, no el de existencia.
 */
async function verificarPropietario(id, id_empresa, { esAdmin = false } = {}) {
  const { data, error } = await supabase
    .from('subproductos')
    .select('id_empresa')
    .eq('id', id)
    .maybeSingle();

  if (error) throw errorHttp(500, 'Error al verificar el subproducto');
  if (!data) throw errorHttp(404, 'Subproducto no encontrado');
  if (!esAdmin && Number(data.id_empresa) !== Number(id_empresa)) {
    throw errorHttp(403, 'No tienes permiso sobre este subproducto');
  }
}

export async function actualizarSubproducto(id, id_empresa, cambios, opciones = {}) {
  await verificarPropietario(id, id_empresa, opciones);

  const datosLimpios = Object.fromEntries(
    Object.entries(cambios).filter(([key]) => CAMPOS_EDITABLES.includes(key))
  );

  if (Object.keys(datosLimpios).length === 0) {
    throw errorHttp(400, 'No se enviaron campos válidos para actualizar');
  }

  let { data, error } = await supabase
    .from('subproductos')
    .update(datosLimpios)
    .eq('id', id)
    .select(CAMPOS_SUBPRODUCTO)
    .single();

  // Si la base de datos tiene la restricción check ck_subproductos_volumen (> 0)
  // y se intenta guardar volumen_disponible = 0 (marcado sin stock):
  if (error && error.code === '23514' && datosLimpios.volumen_disponible === 0) {
    const fallbackDatos = { ...datosLimpios, disponible: false };
    delete fallbackDatos.volumen_disponible;

    const retry = await supabase
      .from('subproductos')
      .update(fallbackDatos)
      .eq('id', id)
      .select(CAMPOS_SUBPRODUCTO)
      .single();

    if (!retry.error && retry.data) {
      data = { ...retry.data, volumen_disponible: 0, disponible: false };
      error = null;
    }
  }

  if (error) {
    if (error.code === '23514') throw errorHttp(400, 'El volumen disponible debe ser mayor que cero');
    if (error.code === '23503') {
      throw errorHttp(400, 'La familia, unidad de medida o municipio indicado no existe');
    }
    throw errorHttp(500, 'Error al actualizar el subproducto: ' + error.message);
  }
  return data;
}

export async function eliminarSubproducto(id, id_empresa, opciones = {}) {
  await verificarPropietario(id, id_empresa, opciones);

  const { data: producto } = await supabase.from('subproductos').select('foto_url').eq('id', id).maybeSingle();

  // Borrar intereses de la publicación primero
  const { error: errorInteres } = await supabase.from('manifestaciones_interes').delete().eq('id_publicacion', id);
  if (errorInteres) {
    throw errorHttp(500, 'Error al eliminar los intereses de la publicación: ' + errorInteres.message);
  }

  const { error } = await supabase.from('subproductos').delete().eq('id', id);
  if (error) throw errorHttp(500, 'Error al eliminar el subproducto: ' + error.message);

  return { foto_url: producto?.foto_url || null };
}

/**
 * HU-07: publicar o despublicar un subproducto.
 * @param {boolean} publicar - true = PUBLICADO, false = BORRADOR
 */
export async function cambiarEstadoPublicacion(id, id_empresa, publicar, opciones = {}) {
  await verificarPropietario(id, id_empresa, opciones);

  const { data, error } = await supabase
    .from('subproductos')
    .update({ id_estado_publicacion: publicar ? ESTADO_PUBLICADO : ESTADO_BORRADOR })
    .eq('id', id)
    .select(CAMPOS_SUBPRODUCTO)
    .single();

  if (error) throw errorHttp(500, 'Error al cambiar el estado de publicación: ' + error.message);
  return data;
}

export { MUNICIPIOS_VALIDOS, ESTADO_BORRADOR, ESTADO_PUBLICADO };