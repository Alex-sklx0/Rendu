/**
 * Middleware global de manejo de errores de Express.
 * Debe montarse ÚLTIMO en server.js (después de todas las rutas).
 *
 * Uso en un controller:
 *   export const miHandler = (req, res, next) => {
 *     try { ... }
 *     catch (err) { next(err); }  // pasa el error aquí
 *   };
 */

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? 'Error interno del servidor';

  console.error(`[ERROR] ${req.method} ${req.path} → ${status}: ${message}`);

  res.status(status).json({ error: message });
};
