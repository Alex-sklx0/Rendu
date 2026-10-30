/**
 * Registro mínimo de acciones del administrador (checklist de seguridad).
 * Por ahora va a la consola del servidor; si más adelante se crea una tabla de
 * auditoría en la BD, solo hay que cambiar esta función.
 */
export function registrarAccionAdmin(req, accion, detalle = {}) {
  console.log(
    JSON.stringify({
      tipo: 'AUDITORIA_ADMIN',
      fecha: new Date().toISOString(),
      id_admin: req.usuario?.id ?? null,
      accion,
      ...detalle,
    })
  );
}