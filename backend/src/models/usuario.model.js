/**
 * Model de usuarios — queries SQL contra la tabla `usuarios`
 * TODO (Carolina/Natalia): implementar cuando el esquema de BD esté listo
 * Ver /database/postgres/ para el esquema.
 *
 * Importar el pool así:
 *   import { pool } from '../config/db.js';
 *
 * Ejemplo de query:
 *   export const crearUsuario = async ({ email, password_hash }) => {
 *     const { rows } = await pool.query(
 *       'INSERT INTO usuarios (email, password_hash) VALUES ($1, $2) RETURNING id, email, rol, fecha_registro',
 *       [email, password_hash]
 *     );
 *     return rows[0];
 *   };
 */
