import rateLimit from 'express-rate-limit';

const base = { standardHeaders: 'draft-7', legacyHeaders: false };
const respuesta = (error) => ({ ok: false, error });

// General para toda la API
export const limiterGeneral = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: respuesta('Demasiadas solicitudes. Intenta de nuevo en unos minutos'),
});

// Login: 10 intentos fallidos por IP cada 15 min (los exitosos no cuentan) = bloqueo temporal
export const limiterLogin = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: respuesta('Demasiados intentos de inicio de sesión. Espera 15 minutos'),
});

export const limiterRegistro = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: respuesta('Demasiados registros desde esta conexión. Intenta más tarde'),
});

export const limiterUpload = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: respuesta('Demasiadas cargas de imágenes. Intenta más tarde'),
});