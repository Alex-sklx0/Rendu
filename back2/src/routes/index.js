import { Router } from 'express';
import usuariosRoutes from './usuarios.routes.js';
import empresasRoutes from './empresas.routes.js';
import personasRoutes from './personas.routes.js';
import subproductosRoutes from './subproductos.routes.js';
import catalogoRoutes from './catalogo.routes.js';

// Router central — montado bajo /api en app.js
export const router = Router();

router.use('/usuarios', usuariosRoutes);
router.use('/empresas', empresasRoutes);
router.use('/personas', personasRoutes);
router.use('/subproductos', subproductosRoutes);
router.use('/catalogo', catalogoRoutes);