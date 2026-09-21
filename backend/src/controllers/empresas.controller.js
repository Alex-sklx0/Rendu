/**
 * Controlador de empresas (migrado de empresas-service)
 * TODO (Carolina): implementar lógica real siguiendo /docs/api-contract.md
 *
 * POST /api/empresas
 * Request:  { id_usuario, nombre, nit, municipio, tipo_actor, medio_contacto? }
 * Response: { id, nombre, nit, municipio, tipo_actor }
 */

// eslint-disable-next-line no-unused-vars
export const registrarEmpresa = (req, res, next) => {
  res.status(201).json({ implemented: false });
};
