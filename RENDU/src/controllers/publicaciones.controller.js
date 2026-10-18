import { obtenerPublicacion } from '../services/catalogo.service.js';
import { anotarPublicaciones } from '../services/sesion.service.js';

/**
 * GET /api/publicaciones/:id — HU-16
 * Detalle de una publicación PUBLICADA + datos de la empresa generadora.
 * Con token, incluye ya_manifeste_interes y es_mia.
 */
export async function getPublicacion(req, res, next) {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ ok: false, error: 'El id de la publicación debe ser numérico' });
    }

    const encontrada = await obtenerPublicacion(Number(id));
    if (!encontrada) {
      return res.status(404).json({ ok: false, error: 'Publicación no encontrada' });
    }

    const [publicacion] = await anotarPublicaciones([encontrada], req.usuario);

    return res.status(200).json({ ok: true, publicacion });
  } catch (error) {
    next(error);
  }
}