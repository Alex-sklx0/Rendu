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

export async function postRegistrarSubproducto(req, res, next) {
  try {
    const {
      id_empresa,
      nombre,
      id_familia_material,
      volumen_disponible,
      id_unidad_medida,
      descripcion,
      id_municipio,
      direccion,
      image_base64, // opcional: imagen en Base64/Data URI (HU-08)
    } = req.body;

    if (
      !id_empresa ||
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
          'Los campos "id_empresa", "nombre", "id_familia_material", "volumen_disponible", "id_unidad_medida" e "id_municipio" son obligatorios',
      });
    }

    // ck_subproductos_volumen exige > 0, no solo >= 0
    if (Number(volumen_disponible) <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'El volumen disponible debe ser mayor que cero',
      });
    }

    if (!MUNICIPIOS_VALIDOS.includes(Number(id_municipio))) {
      return res.status(400).json({
        ok: false,
        error: 'id_municipio inválido. Debe ser un municipio del Valle de Aburrá (1 a 10)',
      });
    }

    let foto_url = null;
    if (image_base64) {
      foto_url = await uploadImageToStorage(image_base64, 'subproductos');
    }

    const subproducto = await registrarSubproducto({
      id_empresa: Number(id_empresa),
      nombre,
      id_familia_material: Number(id_familia_material),
      volumen_disponible: Number(volumen_disponible),
      id_unidad_medida: Number(id_unidad_medida),
      descripcion,
      id_municipio: Number(id_municipio),
      direccion,
      foto_url,
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Subproducto registrado exitosamente (en borrador — publícalo cuando esté listo)',
      subproducto,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubproducto(req, res, next) {
  try {
    const { id } = req.params;
    const subproducto = await obtenerSubproductoPorId(Number(id));
    return res.status(200).json({ ok: true, subproducto });
  } catch (error) {
    next(error);
  }
}

export async function getMisPublicaciones(req, res, next) {
  try {
    const { id_empresa } = req.query;
    if (!id_empresa || !/^\d+$/.test(String(id_empresa))) {
      return res.status(400).json({ ok: false, error: 'id_empresa es obligatorio como query param' });
    }
    const publicaciones = await listarMisPublicaciones(Number(id_empresa));
    return res.status(200).json({ ok: true, publicaciones });
  } catch (error) {
    next(error);
  }
}

export async function patchSubproducto(req, res, next) {
  try {
    const { id } = req.params;
    const { id_empresa, volumen_disponible, image_base64, ...resto } = req.body;

    if (!id_empresa) {
      return res.status(400).json({ ok: false, error: 'id_empresa es obligatorio para editar un subproducto.' });
    }

    if (volumen_disponible !== undefined && Number(volumen_disponible) <= 0) {
      return res.status(400).json({ ok: false, error: 'El volumen disponible debe ser mayor que cero' });
    }

    const cambios = { ...resto };
    if (volumen_disponible !== undefined) cambios.volumen_disponible = Number(volumen_disponible);

    // Si mandan una imagen nueva, subirla y reemplazar la anterior
    if (image_base64) {
      const actual = await obtenerSubproductoPorId(Number(id));
      cambios.foto_url = await uploadImageToStorage(image_base64, 'subproductos', actual.foto_url);
    }

    const subproducto = await actualizarSubproducto(Number(id), Number(id_empresa), cambios);
    return res.status(200).json({ ok: true, mensaje: 'Subproducto actualizado exitosamente', subproducto });
  } catch (error) {
    next(error);
  }
}

export async function deleteSubproducto(req, res, next) {
  try {
    const { id } = req.params;
    const { id_empresa } = req.query;

    if (!id_empresa) {
      return res.status(400).json({ ok: false, error: 'id_empresa es obligatorio para eliminar un subproducto.' });
    }

    const { foto_url } = await eliminarSubproducto(Number(id), Number(id_empresa));
    if (foto_url) {
      await deleteStorageFile(foto_url);
    }

    return res.status(200).json({ ok: true, mensaje: 'Subproducto eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
}

// HU-07: publicar / despublicar
export async function patchPublicarSubproducto(req, res, next) {
  try {
    const { id } = req.params;
    const { id_empresa, publicar } = req.body;

    if (!id_empresa) {
      return res.status(400).json({ ok: false, error: 'id_empresa es obligatorio.' });
    }
    if (typeof publicar !== 'boolean') {
      return res.status(400).json({ ok: false, error: 'El campo "publicar" debe ser true o false.' });
    }

    const subproducto = await cambiarEstadoPublicacion(Number(id), Number(id_empresa), publicar);
    return res.status(200).json({
      ok: true,
      mensaje: publicar ? 'Subproducto publicado exitosamente' : 'Subproducto pasado a borrador',
      subproducto,
    });
  } catch (error) {
    next(error);
  }
}

// HU-08: endpoint de carga de imagen independiente (por si el front sube la foto antes de crear el subproducto)
export async function postSubirImagen(req, res, next) {
  try {
    const { image_base64 } = req.body;
    if (!image_base64) {
      return res.status(400).json({ ok: false, error: 'Se requiere "image_base64".' });
    }
    const foto_url = await uploadImageToStorage(image_base64, 'subproductos');
    return res.status(200).json({ ok: true, mensaje: 'Imagen subida exitosamente', foto_url });
  } catch (error) {
    next(error);
  }
}