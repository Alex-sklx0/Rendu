import { supabase } from '../config/supabaseClient.js';
import { ESTADO_PUBLICADO } from './catalogo.service.js';

function errorHttp(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * HU-19: arma el link de redirección según el medio de contacto registrado.
 * Medios en BD: WHATSAPP, CORREO, TELEFONO, INSTAGRAM. Si no hay datos, link = null.
 */
export function armarLinkContacto({ medio, contacto, nombreSubproducto }) {
  if (!contacto) return null;

  const m = normalizar(medio);
  const mensaje = `Hola, me interesa tu publicación "${nombreSubproducto}" en RENDU.`;

  if (m.includes('whatsapp') || m.includes('wsp')) {
    let numero = String(contacto).replace(/\D/g, '');
    if (numero.length === 10 && numero.startsWith('3')) numero = `57${numero}`;
    if (!numero) return null;
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  }

  if (m.includes('correo') || m.includes('email') || m.includes('mail')) {
    const asunto = `Interés en tu publicación: ${nombreSubproducto}`;
    return `mailto:${String(contacto).trim()}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
  }

  if (m.includes('tel') || m.includes('celular') || m.includes('llamada')) {
    let numero = String(contacto).replace(/[^\d+]/g, '');
    if (!numero) return null;
    if (!numero.startsWith('+') && numero.length === 10) numero = `+57${numero}`;
    return `tel:${numero}`;
  }

  if (m.includes('instagram') || m.includes('insta')) {
    const valor = String(contacto).trim();
    // Acepta URL completa, "@usuario" o "usuario"
    if (/^https?:\/\//i.test(valor)) return valor;
    const usuario = valor.replace(/^@/, '').replace(/\/+$/, '');
    if (!/^[A-Za-z0-9._]{1,30}$/.test(usuario)) return null;
    return `https://instagram.com/${usuario}`;
  }

  return null;
}

async function obtenerPublicacionConEmpresa(id_publicacion) {
  const { data, error } = await supabase
    .from('subproductos')
    .select(
      `id, nombre, disponible, id_estado_publicacion, id_empresa,
       empresas ( id, nombre, id_usuario, contacto, medios_contacto ( nombre ) )`
    )
    .eq('id', id_publicacion)
    .maybeSingle();

  if (error) throw errorHttp(500, 'Error al consultar la publicación: ' + error.message);

  // Borrador o inexistente responden igual (404), como en HU-16
  if (!data || data.id_estado_publicacion !== ESTADO_PUBLICADO) {
    throw errorHttp(404, 'Publicación no encontrada');
  }
  return data;
}

async function verificarUsuario(id_usuario) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', id_usuario)
    .maybeSingle();

  if (error) throw errorHttp(500, 'Error al verificar el usuario');
  if (!data) throw errorHttp(404, 'El usuario indicado no existe');
}

async function buscarInteres(id_usuario, id_publicacion) {
  const { data, error } = await supabase
    .from('manifestaciones_interes')
    .select('id, id_publicacion, id_usuario, fecha')
    .eq('id_usuario', id_usuario)
    .eq('id_publicacion', id_publicacion)
    .maybeSingle();

  if (error) throw errorHttp(500, 'Error al verificar el interés: ' + error.message);
  return data;
}

function construirContacto(publicacion) {
  const empresa = publicacion.empresas;
  const medio = empresa?.medios_contacto?.nombre ?? null;
  const valor = empresa?.contacto ?? null;
  const link = armarLinkContacto({ medio, contacto: valor, nombreSubproducto: publicacion.nombre });

  return {
    empresa: empresa?.nombre ?? null,
    medio,
    contacto: valor,
    link,
    ...(link === null && {
      mensaje: 'La empresa no tiene un medio de contacto registrado o no se pudo armar el enlace',
    }),
  };
}

/**
 * HU-17: registra el interés de un usuario en una publicación (sin duplicados).
 */
export async function registrarInteres({ id_usuario, id_publicacion }) {
  await verificarUsuario(id_usuario);

  const publicacion = await obtenerPublicacionConEmpresa(id_publicacion);

  if (Number(publicacion.empresas?.id_usuario) === Number(id_usuario)) {
    throw errorHttp(403, 'No puedes manifestar interés en tu propia publicación');
  }
  if (!publicacion.disponible) {
    throw errorHttp(409, 'Esta publicación ya no está disponible');
  }

  const existente = await buscarInteres(id_usuario, id_publicacion);
  if (existente) throw errorHttp(409, 'Ya manifestaste interés en esta publicación');

  const { data, error } = await supabase
    .from('manifestaciones_interes')
    .insert([{ id_publicacion, id_usuario }])
    .select('id, id_publicacion, id_usuario, fecha')
    .single();

  if (error) {
    if (error.code === '23505') throw errorHttp(409, 'Ya manifestaste interés en esta publicación');
    throw errorHttp(500, 'Error al registrar el interés: ' + error.message);
  }

  return { interes: data, contacto: construirContacto(publicacion) };
}

/**
 * HU-19: devuelve el link de contacto. Solo si el usuario ya manifestó interés.
 */
export async function obtenerContacto({ id_usuario, id_publicacion }) {
  await verificarUsuario(id_usuario);
  const publicacion = await obtenerPublicacionConEmpresa(id_publicacion);

  const interes = await buscarInteres(id_usuario, id_publicacion);
  if (!interes) {
    throw errorHttp(403, 'Debes manifestar interés en la publicación para ver el contacto');
  }

  return construirContacto(publicacion);
}

/**
 * HU-18: interesados en las publicaciones de una empresa.
 * Solo expone nombre y email del interesado (nunca password_hash, NIT ni cédula).
 */
export async function listarInteresados(id_empresa, id_publicacion = null) {
  const { data: empresa, error: errorEmpresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('id', id_empresa)
    .maybeSingle();

  if (errorEmpresa) throw errorHttp(500, 'Error al verificar la empresa');
  if (!empresa) throw errorHttp(404, 'La empresa indicada no existe');

  let consultaPubs = supabase.from('subproductos').select('id, nombre').eq('id_empresa', id_empresa);
  if (id_publicacion) consultaPubs = consultaPubs.eq('id', id_publicacion);

  const { data: publicaciones, error: errorPubs } = await consultaPubs;
  if (errorPubs) throw errorHttp(500, 'Error al consultar las publicaciones: ' + errorPubs.message);
  if (!publicaciones.length) return [];

  const mapaPubs = new Map(publicaciones.map((p) => [p.id, p]));

  const { data: manifestaciones, error: errorMan } = await supabase
    .from('manifestaciones_interes')
    .select('id, id_publicacion, id_usuario, fecha')
    .in('id_publicacion', [...mapaPubs.keys()])
    .order('fecha', { ascending: false });

  if (errorMan) throw errorHttp(500, 'Error al consultar los interesados: ' + errorMan.message);
  if (!manifestaciones.length) return [];

  const idsUsuarios = [...new Set(manifestaciones.map((m) => m.id_usuario))];

  const [resUsuarios, resEmpresas, resPersonas] = await Promise.all([
    supabase.from('usuarios').select('id, email').in('id', idsUsuarios),
    supabase.from('empresas').select('id_usuario, nombre, id_rol').in('id_usuario', idsUsuarios),
    supabase.from('personas').select('id_usuario, nombre, id_rol').in('id_usuario', idsUsuarios),
  ]);

  if (resUsuarios.error || resEmpresas.error || resPersonas.error) {
    throw errorHttp(500, 'Error al consultar los datos de los interesados');
  }

  const usuarios = new Map(resUsuarios.data.map((u) => [u.id, u]));
  const empresas = new Map(resEmpresas.data.map((e) => [e.id_usuario, e]));
  const personas = new Map(resPersonas.data.map((p) => [p.id_usuario, p]));

  return manifestaciones.map((m) => {
    const usuario = usuarios.get(m.id_usuario);
    const emp = empresas.get(m.id_usuario);
    const per = personas.get(m.id_usuario);
    const publicacion = mapaPubs.get(m.id_publicacion);

    return {
      id: m.id,
      fecha: m.fecha,
      publicacion: { id: publicacion.id, nombre: publicacion.nombre },
      interesado: {
        id_usuario: m.id_usuario,
        nombre: emp?.nombre ?? per?.nombre ?? usuario?.email?.split('@')[0] ?? null,
        email: usuario?.email ?? null,
        tipo: emp ? 'EMPRESA' : per ? 'PERSONA' : null,
        id_rol: emp?.id_rol ?? per?.id_rol ?? null,
      },
    };
  });
}