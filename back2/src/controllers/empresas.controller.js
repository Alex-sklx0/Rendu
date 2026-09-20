import { registrarEmpresa, MUNICIPIOS_VALIDOS, ROLES_VALIDOS_EMPRESA } from '../services/empresas.service.js';

export async function postRegistrarEmpresa(req, res, next) {
  try {
    const { nombre, nit, id_municipio, id_rol, id_usuario } = req.body;

    if (!nombre || !nit || !id_municipio || !id_rol || !id_usuario) {
      return res.status(400).json({
        ok: false,
        error: 'Los campos "nombre", "nit", "id_municipio", "id_rol" e "id_usuario" son obligatorios',
      });
    }

    if (!MUNICIPIOS_VALIDOS.includes(Number(id_municipio))) {
      return res.status(400).json({
        ok: false,
        error: 'id_municipio inválido. Debe ser un municipio del Valle de Aburrá (1 a 10)',
      });
    }

    if (!ROLES_VALIDOS_EMPRESA.includes(Number(id_rol))) {
      return res.status(400).json({
        ok: false,
        error: 'id_rol inválido para una empresa. Debe ser 1 (GENERADOR) o 2 (TRANSFORMADOR)',
      });
    }

    const empresa = await registrarEmpresa({
      nombre,
      nit,
      id_municipio: Number(id_municipio),
      id_rol: Number(id_rol),
      id_usuario: Number(id_usuario),
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Empresa registrada exitosamente',
      empresa,
    });
  } catch (error) {
    next(error);
  }
}