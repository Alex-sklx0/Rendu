/**
 * Middleware global de manejo de errores de Express.
 * Debe montarse ÚLTIMO en app.js (después de todas las rutas).
 *
 * Uso en un controller:
 *   export const miHandler = async (req, res, next) => {
 *     try { ... }
 *     catch (err) { next(err); }  // pasa el error aquí
 *   };
 */

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? 'Error interno del servidor';

  console.error(`[ERROR] ${req.method} ${req.path} → ${status}: ${message}`);

  // Mismo formato { ok: false, error } que usan los controllers en sus respuestas
  // manejadas manualmente (400/404/409), para que el frontend siempre pueda
  // confiar en response.ok sin importar si el error vino de una validación
  // explícita o de una excepción no controlada.
  res.status(status).json({ ok: false, error: message });
};