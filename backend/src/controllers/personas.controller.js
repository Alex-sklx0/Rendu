import { registrarPersona, MUNICIPIOS_VALIDOS, ROLES_VALIDOS_PERSONA } from '../services/personas.service.js';
import { resolverIdUsuario } from '../middlewares/auth.js';

export async function postRegistrarPersona(req, res, next) {
  try {
    const { nombre, cedula, id_municipio, id_rol } = req.body;
    // Con token, el usuario sale del token; sin token, del body (modo compatible)
    const id_usuario = resolverIdUsuario(req, req.body.id_usuario);

    if (!nombre || !cedula || !id_municipio || !id_rol || !id_usuario) {
      return res.status(400).json({
        ok: false,
        error: 'Los campos "nombre", "cedula", "id_municipio", "id_rol" e "id_usuario" son obligatorios',
      });
    }

    if (!MUNICIPIOS_VALIDOS.includes(Number(id_municipio))) {
      return res.status(400).json({
        ok: false,
        error: 'id_municipio inválido. Debe ser un municipio del Valle de Aburrá (1 a 10)',
      });
    }

    if (!ROLES_VALIDOS_PERSONA.includes(Number(id_rol))) {
      return res.status(400).json({
        ok: false,
        error: 'id_rol inválido para una persona. Debe ser 2 (TRANSFORMADOR) o 3 (RECICLADOR)',
      });
    }

    const persona = await registrarPersona({
      nombre,
      cedula,
      id_municipio: Number(id_municipio),
      id_rol: Number(id_rol),
      id_usuario: Number(id_usuario),
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Persona registrada exitosamente',
      persona,
    });
  } catch (error) {
    next(error);
  }
}