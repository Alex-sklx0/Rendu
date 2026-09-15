/**
 * Middleware de validación de req.body contra un schema.
 * TODO (Carolina): elegir librería (zod recomendado) e implementar validaciones por ruta.
 *
 * Ejemplo de uso con zod:
 *   import { z } from 'zod';
 *   import { validate } from '../middlewares/validate.js';
 *
 *   const usuarioSchema = z.object({
 *     email: z.string().email(),
 *     password: z.string().min(8),
 *   });
 *
 *   router.post('/', validate(usuarioSchema), registrarUsuario);
 *
 * Implementación sugerida:
 *   export const validate = (schema) => (req, res, next) => {
 *     const result = schema.safeParse(req.body);
 *     if (!result.success) {
 *       return res.status(400).json({ error: result.error.flatten() });
 *     }
 *     req.body = result.data;
 *     next();
 *   };
 */

// Placeholder — sin dependencias instaladas hasta que Carolina elija la librería
export const validate = (_schema) => (_req, _res, next) => next();
