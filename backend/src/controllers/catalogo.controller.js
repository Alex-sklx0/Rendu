/**
 * Controlador de catálogo (migrado de catalogo-service)
 * TODO (Carolina): implementar lógica real siguiendo /docs/api-contract.md
 *
 * GET /api/catalogo
 * Query params (pendientes de definir): filtros, paginación
 * Response: array de subproductos disponibles
 *
 * Reglas de negocio a implementar (ver /docs/roles.md):
 * - Recicladores ven el catálogo SIN precios
 * - Transformadores y generadores VEN precios
 * - Filtro: cosas a la venta vs. cosas regaladas
 */

import { supabase } from '../config/db.js';

export async function listarCatalogo(req, res, next) {
  try {
    const { q, familia, municipio } = req.query;
    let query = supabase.from('subproductos')
      .select('id, id_empresa, nombre, id_familia_material, volumen_disponible, id_unidad_medida, id_municipio, descripcion, direccion, foto_url, fecha_registro')
    if (q) query = query.ilike('nombre', `%${q}%`);
    if (familia) {
      const { data: row, error } = await supabase.from('familias_material').select('id').ilike('nombre', familia).maybeSingle();
      if (error) throw error;
      if (row) query = query.eq('id_familia_material', row.id);
    }
    if (municipio) {
      const { data: row, error } = await supabase.from('municipios').select('id').ilike('nombre', municipio).maybeSingle();
      if (error) throw error;
      if (row) query = query.eq('id_municipio', row.id);
    }
    const { data, error } = await query.order('fecha_registro', { ascending: false });
    if (error) throw error;

    const [familias, municipios, unidades, empresas] = await Promise.all([
      supabase.from('familias_material').select('id, nombre'),
      supabase.from('municipios').select('id, nombre'),
      supabase.from('unidades_medida').select('id, nombre, abreviatura'),
      supabase.from('empresas').select('id, nombre'),
    ]);
    if (familias.error || municipios.error || unidades.error || empresas.error) {
      throw familias.error || municipios.error || unidades.error || empresas.error;
    }
    const familyMap = new Map(familias.data.map((item) => [String(item.id), item.nombre]));
    const municipalityMap = new Map(municipios.data.map((item) => [String(item.id), item.nombre]));
    const unitMap = new Map(unidades.data.map((item) => [String(item.id), item.abreviatura || item.nombre]));
    const companyMap = new Map(empresas.data.map((item) => [String(item.id), item.nombre]));
    const mapped = data.map((item) => ({
      ...item,
      familia: familyMap.get(String(item.id_familia_material)) || 'Sin familia',
      id_familia: String(item.id_familia_material),
      municipio: municipalityMap.get(String(item.id_municipio)) || 'Sin municipio',
      unidad_volumen: unitMap.get(String(item.id_unidad_medida)) || 'unidad',
      empresa: companyMap.get(String(item.id_empresa)) || 'Empresa',
      image_url: item.foto_url || undefined,
      emoji: '',
    }));
    return res.json({ ok: true, subproductos: mapped });
  } catch (error) {
    return next(error);
  }
}
