// Uso: router.param('id', validarId). Evita 500 por ids no numéricos (ej. /subproductos/abc).
export function validarId(req, res, next, valor) {
  if (!/^\d{1,15}$/.test(String(valor))) {
    return res.status(400).json({ ok: false, error: 'El id debe ser numérico' });
  }
  return next();
}

/**
 * Limpia un texto antes de guardarlo: quita etiquetas HTML, < >, caracteres de control
 * y espacios repetidos, y limita el largo. undefined y null se devuelven sin cambios.
 */
export function limpiarTexto(valor, max = 255, { multilinea = false } = {}) {
  if (valor === undefined || valor === null) return valor;
  let t = String(valor).replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
  t = multilinea
    ? t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    : t.replace(/[\u0000-\u001F\u007F]/g, ' ');
  t = multilinea ? t.replace(/[ \t]+/g, ' ') : t.replace(/\s+/g, ' ');
  return t.trim().slice(0, max);
}