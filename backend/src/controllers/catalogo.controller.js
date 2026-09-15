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

// eslint-disable-next-line no-unused-vars
export const listarCatalogo = (req, res, next) => {
  res.json({ implemented: false });
};
