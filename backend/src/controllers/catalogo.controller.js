import { buscarCatalogo, parsearIds, parsearEntero, limpiarBusqueda } from '../services/catalogo.service.js';
import { anotarPublicaciones } from '../services/sesion.service.js';

/**
 * GET /api/catalogo — HU-13, HU-14, HU-15
 * Query params opcionales y combinables:
 *   q, familias (alias: familia, id_familia_material), municipio (alias: municipios, id_municipio)
 *   pagina (por defecto 1) y limite (por defecto 50, máximo 100)
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
    const pagina = parsearEntero(req.query.pagina, 'pagina', { defecto: 1, min: 1, max: 100000 });
    const limite = parsearEntero(req.query.limite, 'limite', { defecto: 50, min: 1, max: 100 });

    const { items, total } = await buscarCatalogo({ ...filtros, pagina, limite });
    const subproductos = await anotarPublicaciones(items, req.usuario);

    return res.status(200).json({
      ok: true,
      total: subproductos.length, // items de esta página (igual que antes)
      total_registros: total, // todos los que cumplen el filtro
      pagina,
      limite,
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