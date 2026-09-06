/**
 * Service de empresas — lógica de negocio pura, sin SQL directo
 * TODO (Carolina): implementar cuando los models estén listos
 *
 * Ejemplo:
 *   import { crearEmpresa } from '../models/empresa.model.js';
 *
 *   export const registrarEmpresa = async (datos) => {
 *     // validaciones de negocio aquí (ej. verificar que id_usuario exista)
 *     return crearEmpresa(datos);
 *   };
 *
 * Regla de negocio (ver /docs/roles.md):
 *   - Una empresa solo puede ser 'empresa_generadora' o 'empresa_transformadora'
 *   - Una persona puede ser 'reciclador' o 'empresa_transformadora'
 */
