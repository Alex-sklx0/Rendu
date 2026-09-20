import { supabase } from '../config/supabaseClient.js';

const ESTADO_PUBLICADO = 2; // estados_publicacion: 1=BORRADOR, 2=PUBLICADO

/**
 * GET /api/catalogo — HU-09
 * Query params opcionales: q (texto libre por nombre), id_familia_material, id_municipio
 * Solo devuelve subproductos con id_estado_publicacion = PUBLICADO y disponible = true.
 */
export async function getCatalogo(req, res, next) {
  try {
    const { q, id_familia_material, id_municipio } = req.query;

    let query = supabase
      .from('subproductos')
      .select(
        'id, id_empresa, nombre, descripcion, id_familia_material, volumen_disponible, id_unidad_medida, id_municipio, direccion, foto_url, fecha_registro, disponible, id_estado_publicacion'
      )
      .eq('id_estado_publicacion', ESTADO_PUBLICADO)
      .eq('disponible', true);

    if (q) query = query.ilike('nombre', `%${q}%`);
    if (id_familia_material) query = query.eq('id_familia_material', Number(id_familia_material));
    if (id_municipio) query = query.eq('id_municipio', Number(id_municipio));

    const { data, error } = await query.order('fecha_registro', { ascending: false });
    if (error) throw error;

    return res.status(200).json({ ok: true, subproductos: data });
  } catch (error) {
    next(error);
  }
}