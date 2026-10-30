/**
 * Middleware global de manejo de errores de Express.
 * Debe montarse ÚLTIMO en app.js (después de todas las rutas).
 */

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.status ?? err.statusCode ?? 500;

  // El detalle real queda solo en la consola del servidor
  console.error(`[ERROR] ${req.method} ${req.path} → ${status}: ${err.message}`);

  // En 5xx no se devuelve el mensaje interno (puede traer nombres de tablas,
  // restricciones o detalles de Supabase)
  const message = status >= 500 ? 'Error interno del servidor' : (err.message ?? 'Error en la solicitud');

  res.status(status).json({
    ok: false,
    error: message,
    ...(err.codigo && { codigo: err.codigo }),
  });
};