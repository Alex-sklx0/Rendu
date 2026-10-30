import {
  registrarSubproducto,
  obtenerSubproductoPorId,
  listarMisPublicaciones,
  actualizarSubproducto,
  eliminarSubproducto,
  cambiarEstadoPublicacion,
  MUNICIPIOS_VALIDOS,
} from '../services/subproductos.service.js';
import { uploadImageToStorage, deleteStorageFile } from '../services/storage.service.js';
import { resolverIdEmpresa } from '../middlewares/auth.js';
import { limpiarTexto } from '../middlewares/validaciones.js';

const esId = (v) => v !== undefined && v !== null && /^\d{1,15}$/.test(String(v));

function errorHttp(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

export async function postRegistrarSubproducto(req, res, next) {
  try {
    const body = req.body ?? {};
    const {
      id_familia_material,
      volumen_disponible,
      id_unidad_medida,
      id_municipio,
      image_base64, // opcional: imagen en Base64/Data URI (HU-08)
    } = body;
    const nombre = limpiarTexto(body.nombre, 150);
    const descripcion = limpiarTexto(body.descripcion, 2000, { multilinea: true });
    const direccion = limpiarTexto(body.direccion, 255);

    // La empresa sale siempre del token; si el cliente manda otra, 403
    const id_empresa = resolverIdEmpresa(req, body.id_empresa);

    if (
      !nombre ||
      !id_familia_material ||
      volumen_disponible === undefined ||
      volumen_disponible === null ||
      !id_unidad_medida ||
      !id_municipio
    ) {
      return res.status(400).json({
        ok: false,
        error:
          'Los campos "nombre", "id_familia_material", "volumen_disponible", "id_unidad_medida" e "id_municipio" son obligatorios',
      });
    }

    if (![id_familia_material, id_unidad_medida, id_municipio].every(esId)) {
      return res.status(400).json({
        ok: false,
        error: '"id_familia_material", "id_unidad_medida" e "id_municipio" deben ser numéricos',
      });
    }

    if (!Number.isFinite(Number(volumen_disponible)) || Number(volumen_disponible) <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'El volumen disponible debe ser mayor que cero al registrar',
      });
    }

    if (!MUNICIPIOS_VALIDOS.includes(Number(id_municipio))) {
      return res.status(400).json({
        ok: false,
        error: 'id_municipio inválido. Debe ser un municipio del Valle de Aburrá (1 a 10)',
      });
    }

    // Subir imagen opcional (HU-08)
    let foto_url = null;
    if (image_base64) {
      foto_url = await uploadImageToStorage(image_base64, 'subproductos');
    }

    let subproducto;
    try {
      subproducto = await registrarSubproducto({
        id_empresa: Number(id_empresa),
        nombre,
        id_familia_material: Number(id_familia_material),
        volumen_disponible: Number(volumen_disponible),
        id_unidad_medida: Number(id_unidad_medida),
        descripcion: descripcion || null,
        id_municipio: Number(id_municipio),
        direccion: direccion || null,
        foto_url,
      });
    } catch (error) {
      if (foto_url) await deleteStorageFile(foto_url);
      throw error;
    }

    return res.status(201).json({
      ok: true,
      mensaje: 'Subproducto registrado exitosamente (en borrador — publícalo cuando esté listo)',
      subproducto,
    });
  } catch (error) {
    next(error);
  }
}

// Detalle completo (incluye borradores): solo el dueño o un admin.
// El detalle público de publicaciones activas es GET /api/publicaciones/:id
export async function getSubproducto(req, res, next) {
  try {
    const subproducto = await obtenerSubproductoPorId(Number(req.params.id));

    if (!req.usuario.es_admin && Number(subproducto.id_empresa) !== req.usuario.id_empresa) {
      throw errorHttp(403, 'No tienes permiso sobre este subproducto');
    }

    return res.status(200).json({ ok: true, subproducto });
  } catch (error) {
    next(error);
  }
}

export async function getMisPublicaciones(req, res, next) {
  try {
    const id_empresa = resolverIdEmpresa(req, req.query.id_empresa);
    const publicaciones = await listarMisPublicaciones(id_empresa);
    return res.status(200).json({ ok: true, publicaciones });
  } catch (error) {
    next(error);
  }
}

export async function patchSubproducto(req, res, next) {
  try {
    const id = Number(req.params.id);
    const body = req.body ?? {};
    // id_empresa y foto_url del cliente se ignoran: la foto solo cambia vía image_base64
    const { id_empresa: _e, foto_url: _f, volumen_disponible, image_base64, ...resto } = body;
    const id_empresa = resolverIdEmpresa(req, body.id_empresa);

    // Limpiar textos contra XSS
    const limites = { nombre: 150, descripcion: 2000, direccion: 255 };
    for (const [campo, max] of Object.entries(limites)) {
      if (typeof resto[campo] === 'string') {
        resto[campo] = limpiarTexto(resto[campo], max, { multilinea: campo === 'descripcion' });
      }
    }

    if (
      volumen_disponible !== undefined &&
      (!Number.isFinite(Number(volumen_disponible)) || Number(volumen_disponible) < 0)
    ) {
      return res.status(400).json({ ok: false, error: 'El volumen disponible no puede ser negativo' });
    }

    if (resto.nombre !== undefined && (typeof resto.nombre !== 'string' || !resto.nombre.trim())) {
      return res.status(400).json({ ok: false, error: 'El nombre no puede estar vacío' });
    }

    if (resto.disponible !== undefined && typeof resto.disponible !== 'boolean') {
      return res.status(400).json({ ok: false, error: '"disponible" debe ser true o false' });
    }

    for (const campo of ['id_familia_material', 'id_unidad_medida', 'id_municipio']) {
      if (resto[campo] !== undefined) {
        if (!esId(resto[campo])) {
          return res.status(400).json({ ok: false, error: `"${campo}" debe ser numérico` });
        }
        resto[campo] = Number(resto[campo]);
      }
    }
    if (resto.id_municipio !== undefined && !MUNICIPIOS_VALIDOS.includes(resto.id_municipio)) {
      return res.status(400).json({
        ok: false,
        error: 'id_municipio inválido. Debe ser un municipio del Valle de Aburrá (1 a 10)',
      });
    }

    // 1) Verificar dueño ANTES de tocar el Storage
    const actual = await obtenerSubproductoPorId(id);
    if (!req.usuario.es_admin && Number(actual.id_empresa) !== Number(id_empresa)) {
      throw errorHttp(403, 'No tienes permiso sobre este subproducto');
    }

    const cambios = { ...resto };
    if (volumen_disponible !== undefined) {
      const vol = Number(volumen_disponible);
      cambios.volumen_disponible = vol;
      if (vol === 0) {
        cambios.disponible = false;
      }
    }

    // 2) Subir la imagen nueva (si viene)
    let fotoNueva = null;
    if (image_base64 && image_base64 !== actual.foto_url) {
      fotoNueva = await uploadImageToStorage(image_base64, 'subproductos');
      cambios.foto_url = fotoNueva;
    }

    // 3) Actualizar; si falla, borrar la imagen recién subida
    let subproducto;
    try {
      subproducto = await actualizarSubproducto(id, Number(id_empresa), cambios, { esAdmin: req.usuario.es_admin });
    } catch (error) {
      if (fotoNueva) await deleteStorageFile(fotoNueva);
      throw error;
    }

    // 4) Solo ahora se borra la imagen anterior
    if (fotoNueva && actual.foto_url) {
      await deleteStorageFile(actual.foto_url);
    }

    return res.status(200).json({ ok: true, mensaje: 'Subproducto actualizado exitosamente', subproducto });
  } catch (error) {
    next(error);
  }
}

export async function deleteSubproducto(req, res, next) {
  try {
    const id_empresa = req.usuario.es_admin ? null : resolverIdEmpresa(req, req.query.id_empresa);

    const { foto_url } = await eliminarSubproducto(Number(req.params.id), id_empresa, { esAdmin: req.usuario.es_admin });
    if (foto_url) await deleteStorageFile(foto_url);

    return res.status(200).json({ ok: true, mensaje: 'Subproducto eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
}

export async function patchPublicarSubproducto(req, res, next) {
  try {
    const body = req.body ?? {};
    const { publicar } = body;
    const id_empresa = req.usuario.es_admin ? null : resolverIdEmpresa(req, body.id_empresa);

    if (typeof publicar !== 'boolean') {
      return res.status(400).json({ ok: false, error: 'El campo "publicar" debe ser true o false.' });
    }

    const subproducto = await cambiarEstadoPublicacion(
      Number(req.params.id),
      id_empresa,
      publicar,
      { esAdmin: req.usuario.es_admin }
    );
    return res.status(200).json({
      ok: true,
      mensaje: publicar ? 'Subproducto publicado exitosamente' : 'Subproducto pasado a borrador',
      subproducto,
    });
  } catch (error) {
    next(error);
  }
}

// HU-08: carga de imagen independiente. Exige sesión con empresa.
export async function postSubirImagen(req, res, next) {
  try {
    resolverIdEmpresa(req, undefined);

    const { image_base64 } = req.body ?? {};
    if (!image_base64) {
      return res.status(400).json({ ok: false, error: 'Se requiere "image_base64".' });
    }
    const foto_url = await uploadImageToStorage(image_base64, 'subproductos');
    return res.status(200).json({ ok: true, mensaje: 'Imagen subida exitosamente', foto_url });
  } catch (error) {
    next(error);
  }
}