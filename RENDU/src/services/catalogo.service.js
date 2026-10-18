import { supabase } from '../config/supabaseClient.js';

// estados_publicacion en Supabase: 1 = BORRADOR, 2 = PUBLICADO
export const ESTADO_PUBLICADO = 2;

// Campos del subproducto + nombres legibles vía relaciones (FK) de Supabase.
const SELECT_PUBLICACION = `
  id, id_empresa, nombre, descripcion, id_familia_material, volumen_disponible,
  id_unidad_medida, id_municipio, direccion, foto_url, fecha_registro, disponible,
  familias_material ( nombre ),
  municipios ( nombre ),
  unidades_medida ( nombre, abreviatura ),
  empresas ( id, nombre, id_rol, municipios ( nombre ) )
`;

function errorHttp(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

/**
 * Convierte "1,2,3" (o ?x=1&x=2) en [1, 2, 3]. Lanza 400 si algún valor no es numérico.
 */
export function parsearIds(valor, nombreParametro) {
  if (valor === undefined || valor === null || valor === '') return [];
  const partes = [].concat(valor)
    .flatMap((v) => String(v).split(','))
    .map((s) => s.trim())
    .filter(Boolean);
  if (partes.some((p) => !/^\d+$/.test(p))) {
    throw errorHttp(
      400,
      `El parámetro "${nombreParametro}" debe ser uno o varios ids numéricos separados por coma (ej. 1,2)`
    );
  }
  return [...new Set(partes.map(Number))];
}

/**
 * Limpia el texto de búsqueda: quita caracteres que rompen el filtro .or() de
 * PostgREST (, ( ) " ') y los comodines de LIKE (% _ *), y limita el largo.
 */
export function limpiarBusqueda(q) {
  if (typeof q !== 'string') return '';
  return q.replace(/[%_,()"'\\*]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
}

/** Aplana la fila de Supabase a un objeto simple para el frontend. */
export function formatearPublicacion(fila) {
  const { familias_material, municipios, unidades_medida, empresas, ...base } = fila;
  const unidad = unidades_medida?.abreviatura ?? unidades_medida?.nombre ?? null;
  return {
    ...base,
    familia: familias_material?.nombre ?? null,
    municipio: municipios?.nombre ?? null,
    unidad,
    empresa: empresas?.nombre ?? null,
    // alias que ya usa el frontend actual
    id_familia: String(base.id_familia_material),
    unidad_volumen: unidad,
    image_url: base.foto_url ?? undefined,
  };
}

/**
 * HU-13/14/15: catálogo público. Solo PUBLICADO y disponible.
 * Filtros combinables (AND): texto, familias (varias), municipios.
 */
export async function buscarCatalogo({ q, familias = [], municipios = [] }) {
  let query = supabase
    .from('subproductos')
    .select(SELECT_PUBLICACION)
    .eq('id_estado_publicacion', ESTADO_PUBLICADO)
    .eq('disponible', true);

  if (q) {
    const patron = `%${q}%`;
    query = query.or(`nombre.ilike.${patron},descripcion.ilike.${patron}`);
  }
  if (familias.length) query = query.in('id_familia_material', familias);
  if (municipios.length) query = query.in('id_municipio', municipios);

  const { data, error } = await query.order('fecha_registro', { ascending: false });
  if (error) throw error;
  return data.map(formatearPublicacion);
}

/**
 * HU-16: detalle de una publicación. Solo si está PUBLICADA (los borradores
 * responden igual que si no existieran). Incluye datos de la empresa generadora.
 * No se expone el NIT.
 */
export async function obtenerPublicacion(id) {
  const { data, error } = await supabase
    .from('subproductos')
    .select(SELECT_PUBLICACION)
    .eq('id', id)
    .eq('id_estado_publicacion', ESTADO_PUBLICADO)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const publicacion = formatearPublicacion(data);
  publicacion.empresa_generadora = data.empresas
    ? {
        id: data.empresas.id,
        nombre: data.empresas.nombre,
        id_rol: data.empresas.id_rol,
        municipio: data.empresas.municipios?.nombre ?? null,
      }
    : null;
  return publicacion;
}