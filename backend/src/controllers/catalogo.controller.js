// Controlador del catálogo público

import { buscarCatalogo, parsearIds, limpiarBusqueda } from '../services/catalogo.service.js';

// GET /api/catalogo — subproductos publicados y disponibles con filtros opcionales
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

// Alias para retrocompatibilidad
export const listarCatalogo = getCatalogo;
