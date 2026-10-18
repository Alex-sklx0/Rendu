// Ruta para consultar los medios de contacto disponibles en la tabla medios_contacto
import { Router } from 'express';
import { supabase } from '../config/supabaseClient.js';

const router = Router();

// GET /api/medios-contacto
router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('medios_contacto')
      .select('id, nombre')
      .order('id', { ascending: true });

    if (error) throw error;

    res.json({ ok: true, medios_contacto: data ?? [] });
  } catch (err) {
    next(err);
  }
});

export default router;
