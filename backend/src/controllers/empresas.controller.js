// Controlador para registro y gestion de empresas

import { supabase } from '../config/db.js';

// Registra el perfil de una empresa vinculada a un usuario
export async function registrarEmpresa(req, res, next) {
  try {
    const { id_usuario, nombre, nit, municipio, id_municipio, tipo_actor, id_rol, medio_contacto } = req.body;
    
    // Validar campos obligatorios
    if (!id_usuario || !nombre || !nit || (!municipio && !id_municipio) || (!tipo_actor && !id_rol)) {
      return res.status(400).json({ ok: false, error: 'id_usuario, nombre, nit, municipio y tipo_actor son obligatorios.' });
    }

    // Normalizar NIT sin espacios ni puntos
    const nitNormalizado = String(nit).trim().replace(/[.\s]/g, '');

    // Verificar si ya existe una empresa con ese NIT
    const { data: empresasList } = await supabase.from('empresas').select('id, nit');
    if (empresasList?.some(e => String(e.nit).trim().replace(/[.\s]/g, '') === nitNormalizado)) {
      return res.status(409).json({ ok: false, error: 'Ya existe una empresa registrada con ese NIT.' });
    }

    // Resolver ID de municipio
    let municipioId = id_municipio;
    if (!municipioId && municipio) {
      const cleanMuni = municipio.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const { data: municipiosList } = await supabase.from('municipios').select('id, nombre');
      const match = municipiosList?.find(m => m.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === cleanMuni);
      municipioId = match?.id || 1;
    }
    if (!municipioId) municipioId = 1;

    // Resolver ID de rol (Generador o Transformador)
    let rolId = id_rol;
    if (!rolId) {
      const actorLower = String(tipo_actor).toLowerCase();
      let roleName = 'GENERADOR';
      if (actorLower.includes('transform') || actorLower.includes('eca') ||
          actorLower.includes('recicla') || actorLower.includes('gestor')) {
        roleName = 'TRANSFORMADOR';
      }
      const { data: roleRow } = await supabase.from('roles').select('id').ilike('nombre', roleName).maybeSingle();
      rolId = roleRow?.id || 1;
    }

    // Insertar registro de empresa
    const { data, error } = await supabase
      .from('empresas')
      .insert({ id_usuario, nombre, nit: nitNormalizado, id_municipio: municipioId, id_rol: rolId })
      .select('id, id_usuario, nombre, nit, id_municipio, id_rol')
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ ok: false, error: 'Ya existe una empresa registrada con ese NIT o con el mismo usuario.' });
      if (error.code === '23503') return res.status(404).json({ ok: false, error: 'El usuario no existe o fue eliminado.' });
      throw error;
    }
    return res.status(201).json({ ok: true, mensaje: 'Empresa registrada exitosamente', empresa: data });
  } catch (error) {
    return next(error);
  }
}
