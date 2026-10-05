import { Router } from 'express';
import usuariosRouter from './usuarios.routes.js';
import empresasRouter from './empresas.routes.js';
import personasRouter from './personas.routes.js';
import subproductosRouter from './subproductos.routes.js';
import catalogoRouter from './catalogo.routes.js';
import publicacionesRouter from './publicaciones.routes.js';

// Router central — montado bajo /api en app.js
export const router = Router();

router.use('/usuarios', usuariosRouter);
router.use('/empresas', empresasRouter);
router.use('/personas', personasRouter);
router.use('/subproductos', subproductosRouter);
router.use('/catalogo', catalogoRouter);
router.use('/publicaciones', publicacionesRouter);
