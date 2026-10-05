// Controlador para el detalle publico de una publicacion

import { obtenerPublicacion } from '../services/catalogo.service.js';

// GET /api/publicaciones/:id — detalle de una publicación activa (HU-16)
export async function getPublicacion(req, res, next) {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ ok: false, error: 'El id de la publicación debe ser numérico' });
    }

    const publicacion = await obtenerPublicacion(Number(id));
    if (!publicacion) {
      return res.status(404).json({ ok: false, error: 'Publicación no encontrada' });
    }

    return res.status(200).json({ ok: true, publicacion });
  } catch (error) {
    next(error);
  }
}
