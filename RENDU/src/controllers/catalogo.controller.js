import { buscarCatalogo, parsearIds, limpiarBusqueda } from '../services/catalogo.service.js';

/**
 * GET /api/catalogo — HU-13, HU-14, HU-15
 * Query params (todos opcionales y combinables):
 *   q          texto libre (nombre o descripción)
 *   familias   ids de familia separados por coma, ej. 1,2   (alias: familia, id_familia_material)
 *   municipio  ids de municipio separados por coma, ej. 3   (alias: municipios, id_municipio)
 * Solo devuelve subproductos PUBLICADOS y disponibles.
 */
export async function getCatalogo(req, res, next) {
  try {
    const { q, familias, familia, id_familia_material, municipio, municipios, id_municipio } = req.query;

    const filtros = {
      q: limpiarBusqueda(q),
      familias: parsearIds(familias ?? familia ?? id_familia_material, 'familias'),
      municipios: parsearIds(municipio ?? municipios ?? id_municipio, 'municipio'),
    };

    const subproductos = await buscarCatalogo(filtros);

    return res.status(200).json({
      ok: true,
      total: subproductos.length,
      filtros,
      ...(subproductos.length === 0 && {
        mensaje: 'No se encontraron subproductos con los criterios indicados',
      }),
      subproductos,
    });
  } catch (error) {
    next(error);
  }
}