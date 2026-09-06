/**
 * Model de subproductos — queries SQL contra la tabla `subproductos`
 * TODO (Carolina/Natalia): implementar cuando el esquema de BD esté listo
 * Ver /database/postgres/ para el esquema.
 *
 * Importar el pool así:
 *   import { pool } from '../config/db.js';
 *
 * Ejemplo de query:
 *   export const crearSubproducto = async ({ id_empresa, nombre, descripcion, id_familia, volumen_disponible, unidad_volumen, municipio }) => {
 *     const { rows } = await pool.query(
 *       'INSERT INTO subproductos (...) VALUES (...) RETURNING id, nombre, familia, volumen_disponible, unidad_volumen, municipio, estado_publicacion, disponible',
 *       [...]
 *     );
 *     return rows[0];
 *   };
 */
