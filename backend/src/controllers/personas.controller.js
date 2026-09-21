// Controlador para personas naturales y recicladores

import { supabase } from '../config/db.js';

// Registra el perfil de una persona natural vinculada a un usuario
export async function registrarPersona(req, res, next) {
  try {
    const { id_usuario, nombre, cedula, municipio, id_municipio, tipo_actor, id_rol } = req.body;
    
    // Validar campos requeridos
    if (!id_usuario || !nombre || (!municipio && !id_municipio)) {
      return res.status(400).json({ ok: false, error: 'id_usuario, nombre y municipio son obligatorios.' });
    }

    // Resolver ID de municipio
    let municipioId = id_municipio;
    if (!municipioId && municipio) {
      const cleanMuni = municipio.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const { data: municipiosList } = await supabase.from('municipios').select('id, nombre');
      const match = municipiosList?.find(m =>
        m.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === cleanMuni
      );
      municipioId = match?.id || 1;
    }
    if (!municipioId) municipioId = 1;

    // Resolver ID de rol
    let rolId = id_rol;
    if (!rolId) {
      const actorLower = String(tipo_actor || 'reciclador').toLowerCase();
      let roleName = 'RECICLADOR';
      if (actorLower.includes('transform') || actorLower.includes('eca')) {
        roleName = 'TRANSFORMADOR';
      } else if (actorLower.includes('genera')) {
        roleName = 'GENERADOR';
      }
      const { data: roleRow } = await supabase.from('roles').select('id').ilike('nombre', roleName).maybeSingle();
      rolId = roleRow?.id || 1;
    }

    // Guardar persona natural en la base de datos
    const { data, error } = await supabase
      .from('personas')
      .insert({ id_usuario, nombre, cedula: cedula || null, id_municipio: municipioId, id_rol: rolId })
      .select('id, id_usuario, nombre, cedula, id_municipio, id_rol')
      .single();

    // Manejo de errores especificos
    if (error) {
      if (error.code === '23505') {
        const msg = String(error.message || '').toLowerCase();
        if (msg.includes('cedula')) {
          return res.status(409).json({ ok: false, error: 'El número de documento (cédula) ya está registrado. Usa otro número o inicia sesión.' });
        }
        return res.status(409).json({ ok: false, error: 'Ya existe un perfil de persona registrado con estos datos.' });
      }
      if (error.code === '23503') return res.status(404).json({ ok: false, error: 'El usuario no existe o fue eliminado.' });
      throw error;
    }
    return res.status(201).json({ ok: true, mensaje: 'Perfil de persona registrado exitosamente', persona: data });
  } catch (error) {
    return next(error);
  }
}
