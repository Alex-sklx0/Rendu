// Middleware para manejo centralizado de errores

// Mensajes claros para errores comunes de PostgreSQL
const PG_ERROR_MESSAGES = {
  '23505': 'Ya existe un registro con esa información. Verifica los datos e intenta de nuevo.',
  '23503': 'No se encontró un registro relacionado. Asegúrate de que todos los datos existan.',
  '23502': 'Falta un campo obligatorio. Por favor completa todos los campos requeridos.',
  '23514': 'Los datos ingresados no cumplen con las restricciones del sistema.',
  '22001': 'Uno de los valores ingresados es demasiado largo.',
  '22003': 'Uno de los valores numéricos está fuera del rango permitido.',
  '22007': 'El formato de la fecha ingresada no es válido.',
  '42703': 'Error interno: campo desconocido. Contacta al administrador.',
  'PGRST116': 'El recurso solicitado no fue encontrado.',
  'PGRST301': 'Solicitud malformada. Revisa los datos enviados.',
};

// Terminos de error tecnico que no deben mostrarse directo al usuario
const TECHNICAL_PATTERNS = [
  'syntax', 'violates', 'duplicate key', 'null value', 'column', 'relation',
  'operator', 'function', 'constraint', 'PGRST', 'PostgresError',
];

function isTechnicalMessage(msg) {
  if (!msg) return true;
  const lower = msg.toLowerCase();
  return TECHNICAL_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}

// Handler de express para responder errores con formato amigable
export const errorHandler = (err, req, res, next) => {
  const status = err.status ?? err.statusCode ?? 500;

  // Extraer codigo de error si viene de la BD
  const pgCode = err.code;
  const friendlyPgMessage = pgCode ? PG_ERROR_MESSAGES[pgCode] : undefined;

  // Determinar el mensaje mas adecuado para el usuario
  let message;
  if (friendlyPgMessage) {
    message = friendlyPgMessage;
  } else if (err.message && !isTechnicalMessage(err.message)) {
    message = err.message;
  } else {
    message = 'Ocurrió un error inesperado. Por favor inténtalo de nuevo.';
  }

  console.error(`[ERROR] ${req.method} ${req.path} → ${status}: ${err.message}`);

  res.status(status).json({ ok: false, error: message });
};
