/**
 * Controlador de subproductos (migrado de subproductos-service)
 * TODO (Carolina): implementar lógica real siguiendo /docs/api-contract.md
 *
 * POST /api/subproductos
 * Request:  { id_empresa, nombre, descripcion?, id_familia, volumen_disponible, unidad_volumen, municipio }
 * Response: { id, nombre, familia, volumen_disponible, unidad_volumen, municipio, estado_publicacion, disponible }
 */

// eslint-disable-next-line no-unused-vars
export const registrarSubproducto = (req, res, next) => {
  res.status(201).json({ implemented: false });
};
