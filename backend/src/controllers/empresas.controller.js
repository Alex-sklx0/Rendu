/**
 * Controlador de empresas (migrado de empresas-service)
 * TODO (Carolina): implementar lógica real siguiendo /docs/api-contract.md
 *
 * POST /api/empresas
 * Request:  { id_usuario, nombre, nit, municipio, tipo_actor, medio_contacto? }
 * Response: { id, nombre, nit, municipio, tipo_actor }
 */

import { supabase } from '../config/db.js';

export async function registrarEmpresa(req, res, next) {
  try {
    const { id_usuario, nombre, nit, municipio, id_municipio, tipo_actor, id_rol, medio_contacto } = req.body;
    if (!id_usuario || !nombre || !nit || (!municipio && !id_municipio) || (!tipo_actor && !id_rol)) {
      return res.status(400).json({ ok: false, error: 'id_usuario, nombre, nit, municipio y tipo_actor son obligatorios.' });
    }

    let municipioId = id_municipio;
    if (!municipioId && municipio) {
      const cleanMuni = municipio.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const { data: municipiosList } = await supabase.from('municipios').select('id, nombre');
      const match = municipiosList?.find(m => m.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === cleanMuni);
      municipioId = match?.id || 1;
    }
    if (!municipioId) municipioId = 1;

    let rolId = id_rol;
    if (!rolId) {
      const actorLower = String(tipo_actor).toLowerCase();
      let roleName = 'GENERADOR';
      if (actorLower.includes('transform') || actorLower.includes('eca')) {
        roleName = 'TRANSFORMADOR';
      } else if (actorLower.includes('recicla') || actorLower.includes('gestor')) {
        roleName = 'RECICLADOR';
      }
      const { data: roleRow } = await supabase.from('roles').select('id').ilike('nombre', roleName).maybeSingle();
      rolId = roleRow?.id || 1;
    }

    const { data, error } = await supabase
      .from('empresas')
      .insert({ id_usuario, nombre, nit, id_municipio: municipioId, id_rol: rolId })
      .select('id, id_usuario, nombre, nit, id_municipio, id_rol')
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ ok: false, error: 'El NIT ya está registrado.' });
      if (error.code === '23503') return res.status(404).json({ ok: false, error: 'El usuario no existe.' });
      throw error;
    }
    return res.status(201).json({ ok: true, mensaje: 'Empresa registrada exitosamente', empresa: data });
  } catch (error) {
    return next(error);
  }
}
