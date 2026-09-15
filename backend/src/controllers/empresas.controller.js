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
    if (!municipioId) {
      const { data: municipioRow, error: municipioError } = await supabase
        .from('municipios').select('id').ilike('nombre', municipio.trim()).maybeSingle();
      if (municipioError) throw municipioError;
      municipioId = municipioRow?.id;
    }

    let rolId = id_rol;
    if (!rolId) {
      if (!['empresa_generadora', 'empresa_transformadora'].includes(tipo_actor)) {
        return res.status(400).json({ ok: false, error: 'El tipo de empresa no es válido.' });
      }
      const roleName = tipo_actor === 'empresa_generadora' ? 'GENERADOR' : 'TRANSFORMADOR';
      const { data: roleRow, error: roleError } = await supabase
        .from('roles').select('id').ilike('nombre', roleName).maybeSingle();
      if (roleError) throw roleError;
      rolId = roleRow?.id;
    }

    if (!municipioId || !rolId) {
      return res.status(400).json({ ok: false, error: 'El municipio o rol indicado no existe.' });
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
