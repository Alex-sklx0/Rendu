/**
 * Model de empresas — queries SQL contra la tabla `empresas`
 * TODO (Carolina/Natalia): implementar cuando el esquema de BD esté listo
 * Ver /database/postgres/ para el esquema.
 *
 * Importar el pool así:
 *   import { pool } from '../config/db.js';
 *
 * Ejemplo de query:
 *   export const crearEmpresa = async ({ id_usuario, nombre, nit, municipio, tipo_actor, medio_contacto }) => {
 *     const { rows } = await pool.query(
 *       'INSERT INTO empresas (id_usuario, nombre, nit, municipio, tipo_actor, medio_contacto) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, nombre, nit, municipio, tipo_actor',
 *       [id_usuario, nombre, nit, municipio, tipo_actor, medio_contacto]
 *     );
 *     return rows[0];
 *   };
 */
