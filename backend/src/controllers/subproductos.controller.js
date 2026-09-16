/**
 * Controlador de subproductos (migrado de subproductos-service)
 * TODO (Carolina): implementar lógica real siguiendo /docs/api-contract.md
 *
 * POST /api/subproductos
 * Request:  { id_empresa, nombre, descripcion?, id_familia, volumen_disponible, unidad_volumen, municipio }
 * Response: { id, nombre, familia, volumen_disponible, unidad_volumen, municipio, estado_publicacion, disponible }
 */

import { supabase } from '../config/db.js';

const fields = 'id, id_empresa, nombre, descripcion, id_familia_material, volumen_disponible, id_unidad_medida, id_municipio, direccion, foto_url, fecha_registro';

const FAMILY_MAP = {
  'papel_carton': 'Papel y cartón',
  'papel y carton': 'Papel y cartón',
  'papel y cartón': 'Papel y cartón',
  'plasticos': 'Plásticos',
  'plásticos': 'Plásticos',
  'vidrio': 'Vidrio',
  'metales': 'Metales',
  'textil': 'Textiles',
  'textiles': 'Textiles',
  'madera': 'Madera',
};

const UNIT_MAP = {
  'kg': 'kg',
  'kilogramo': 'kg',
  'kilogramos': 'kg',
  'ton': 't',
  't': 't',
  'tonelada': 't',
  'toneladas': 't',
  'm3': 'm³',
  'm³': 'm³',
  'unidades': 'kg',
};

async function resolveId(table, value, nameField = 'nombre') {
  if (value === undefined || value === null || value === '') return undefined;

  const strVal = String(value).trim().toLowerCase();
  if (/^\d+$/.test(strVal)) {
    const num = Number(strVal);
    const { data } = await supabase.from(table).select('id').eq('id', num).maybeSingle();
    if (data) return data.id;
  }

  let searchValue = String(value).trim();
  if (table === 'familias_material' && FAMILY_MAP[strVal]) {
    searchValue = FAMILY_MAP[strVal];
  } else if (table === 'unidades_medida' && UNIT_MAP[strVal]) {
    searchValue = UNIT_MAP[strVal];
    nameField = 'abreviatura';
  }

  let { data, error } = await supabase.from(table).select('id').ilike(nameField, searchValue).maybeSingle();
  if (!data && nameField !== 'nombre') {
    const res = await supabase.from(table).select('id').ilike('nombre', searchValue).maybeSingle();
    data = res.data;
  }
  if (!data && table === 'municipios') {
    const cleanSearch = searchValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const { data: municipiosList } = await supabase.from('municipios').select('id, nombre');
    if (municipiosList) {
      const match = municipiosList.find(m => m.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === cleanSearch);
      if (match) data = match;
    }
  }
  if (error) throw error;
  return data?.id;
}

async function present(item) {
  const [family, unit, municipality, company] = await Promise.all([
    supabase.from('familias_material').select('id, nombre').eq('id', item.id_familia_material).maybeSingle(),
    supabase.from('unidades_medida').select('id, nombre, abreviatura').eq('id', item.id_unidad_medida).maybeSingle(),
    supabase.from('municipios').select('id, nombre').eq('id', item.id_municipio).maybeSingle(),
    supabase.from('empresas').select('id, nombre, id_usuario').eq('id', item.id_empresa).maybeSingle(),
  ]);
  if (family.error || unit.error || municipality.error || company.error) throw family.error || unit.error || municipality.error || company.error;

  let usuarioNombre = undefined;
  if (company.data?.id_usuario) {
    const userRes = await supabase.from('usuarios').select('id, email').eq('id', company.data.id_usuario).maybeSingle();
    if (userRes.data?.email) {
      usuarioNombre = userRes.data.email.split('@')[0];
    }
  }

  return {
    ...item,
    id_familia: String(item.id_familia_material),
    familia: family.data?.nombre || 'Sin familia',
    unidad_volumen: unit.data?.abreviatura || unit.data?.nombre || 'unidad',
    municipio: municipality.data?.nombre || 'Sin municipio',
    empresa: company.data?.nombre || 'Empresa',
    usuario: usuarioNombre || company.data?.nombre || 'Usuario',
    image_url: item.foto_url || undefined,
    emoji: '',
    estado_publicacion: 'publicado',
    disponible: true,
  };
}

export async function registrarSubproducto(req, res, next) {
  try {
    const { id_empresa, nombre, descripcion, id_familia, id_familia_material, volumen_disponible, unidad_volumen, id_unidad_medida, municipio, id_municipio, direccion, image_url } = req.body;
    if (!id_empresa || !nombre || (!id_familia && !id_familia_material) || volumen_disponible === undefined || (!unidad_volumen && !id_unidad_medida) || (!municipio && !id_municipio)) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios del subproducto.' });
    }
    if (Number(volumen_disponible) < 0) return res.status(400).json({ ok: false, error: 'El volumen no puede ser negativo.' });

    const familyId = await resolveId('familias_material', id_familia_material ?? id_familia);
    const unitId = await resolveId('unidades_medida', id_unidad_medida ?? unidad_volumen, 'abreviatura');
    const municipalityId = await resolveId('municipios', id_municipio ?? municipio);
    if (!familyId || !unitId || !municipalityId) return res.status(400).json({ ok: false, error: 'Familia, unidad o municipio no existe.' });

    let companyId = undefined;
    if (id_empresa && /^\d+$/.test(String(id_empresa))) {
      companyId = Number(id_empresa);
    }
    if (!companyId) {
      const { data: firstCompany } = await supabase.from('empresas').select('id').order('id', { ascending: true }).limit(1).maybeSingle();
      companyId = firstCompany?.id;
    }
    if (!companyId) {
      return res.status(400).json({ ok: false, error: 'No existe ninguna empresa registrada para asignar la publicación.' });
    }

    const safeFotoUrl = (image_url && typeof image_url === 'string') ? image_url.trim().slice(0, 500) : null;

    const { data, error } = await supabase.from('subproductos').insert({
      id_empresa: companyId, nombre, descripcion: descripcion || null, id_familia_material: familyId,
      volumen_disponible: Number(volumen_disponible), id_unidad_medida: unitId, id_municipio: municipalityId,
      direccion: direccion || null, foto_url: safeFotoUrl,
    }).select(fields).single();

    if (error) {
      if (error.code === '23503') return res.status(404).json({ ok: false, error: 'La empresa o familia indicada no existe.' });
      throw error;
    }
    return res.status(201).json({ ok: true, mensaje: 'Subproducto registrado exitosamente', subproducto: await present(data) });
  } catch (error) {
    return next(error);
  }
}

export async function obtenerSubproducto(req, res, next) {
  try {
    const { data, error } = await supabase.from('subproductos').select(fields).eq('id', req.params.id).single();
    if (error?.code === 'PGRST116') return res.status(404).json({ ok: false, error: 'Subproducto no encontrado.' });
    if (error) throw error;
    return res.json({ ok: true, subproducto: await present(data) });
  } catch (error) {
    return next(error);
  }
}

export async function actualizarSubproducto(req, res, next) {
  try {
    const allowed = ['nombre', 'descripcion', 'volumen_disponible', 'foto_url', 'direccion'];
    const changes = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (Object.hasOwn(req.body, 'image_url')) {
      const url = req.body.image_url;
      changes.foto_url = (url && typeof url === 'string') ? url.trim().slice(0, 500) : null;
    }
    if (req.body.id_familia_material || req.body.id_familia) changes.id_familia_material = await resolveId('familias_material', req.body.id_familia_material ?? req.body.id_familia);
    if (req.body.id_unidad_medida || req.body.unidad_volumen) changes.id_unidad_medida = await resolveId('unidades_medida', req.body.id_unidad_medida ?? req.body.unidad_volumen, 'abreviatura');
    if (req.body.id_municipio || req.body.municipio) changes.id_municipio = await resolveId('municipios', req.body.id_municipio ?? req.body.municipio);
    const { data, error } = await supabase.from('subproductos').update(changes).eq('id', req.params.id).select(fields).single();
    if (error?.code === 'PGRST116') return res.status(404).json({ ok: false, error: 'Subproducto no encontrado.' });
    if (error) throw error;
    return res.json({ ok: true, mensaje: 'Subproducto actualizado exitosamente', subproducto: await present(data) });
  } catch (error) {
    return next(error);
  }
}

export async function misPublicaciones(req, res, next) {
  try {
    const { id_empresa } = req.query;
    if (!id_empresa) return res.status(400).json({ ok: false, error: 'id_empresa es obligatorio mientras no exista autenticación.' });
    const { data, error } = await supabase.from('subproductos').select(fields).eq('id_empresa', id_empresa).order('fecha_registro', { ascending: false });
    if (error) throw error;
    return res.json({ ok: true, publicaciones: await Promise.all(data.map(present)) });
  } catch (error) {
    return next(error);
  }
}
