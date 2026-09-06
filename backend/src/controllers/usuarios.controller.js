/**
 * Controlador de usuarios (migrado de auth-service)
 * TODO (Carolina): implementar lógica real siguiendo /docs/api-contract.md
 *
 * POST /api/usuarios
 * Request:  { email: string, password: string }
 * Response: { id, email, rol, fecha_registro }
 */

// eslint-disable-next-line no-unused-vars
export const registrarUsuario = (req, res, next) => {
  res.status(201).json({ implemented: false });
};
