import {
  registrarPersona,
  actualizarPersona,
  existeCedula,
  MUNICIPIOS_VALIDOS,
  ROLES_VALIDOS_PERSONA,
} from '../services/personas.service.js';
import { eliminarUsuarioHuerfano } from '../services/usuarios.service.js';
import { resolverIdUsuario } from '../middlewares/auth.js';
import { limpiarTexto } from '../middlewares/validaciones.js';

export async function getVerificarCedula(req, res, next) {
  try {
    const cedula = req.params.cedula ?? req.query.cedula;
    if (!cedula || !String(cedula).trim()) {
      return res.status(400).json({ ok: false, error: 'La cédula es obligatoria' });
    }
    const existe = await existeCedula(cedula);
    return res.status(200).json({ ok: true, existe });
  } catch (error) {
    next(error);
  }
}

export async function postRegistrarPersona(req, res, next) {
  let id_usuario;
  try {
    const body = req.body ?? {};
    const { cedula, id_municipio, id_rol } = body;
    const nombre = limpiarTexto(body.nombre, 150);
    // El usuario sale siempre del token; si el cliente manda otro id_usuario, 403
    id_usuario = resolverIdUsuario(req, body.id_usuario);

    if (!nombre || !cedula || !id_municipio || !id_rol) {
      return res.status(400).json({
        ok: false,
        error: 'Los campos "nombre", "cedula", "id_municipio" e "id_rol" son obligatorios',
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
      cedula: String(cedula).trim(),
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
    // Si falló el registro de la persona (ej: cédula duplicada 409), limpiar el usuario huérfano
    if (id_usuario) {
      await eliminarUsuarioHuerfano(Number(id_usuario)).catch(() => {});
    }
    next(error);
  }
}

export async function putActualizarPersona(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, cedula, id_municipio, id_rol } = req.body ?? {};
    const cambios = {};

    if (nombre !== undefined) cambios.nombre = limpiarTexto(nombre, 150);
    if (cedula !== undefined) cambios.cedula = String(cedula).trim();
    if (id_municipio !== undefined) {
      if (!MUNICIPIOS_VALIDOS.includes(Number(id_municipio))) {
        return res.status(400).json({ ok: false, error: 'id_municipio inválido (1 a 10)' });
      }
      cambios.id_municipio = Number(id_municipio);
    }
    if (id_rol !== undefined) {
      if (!ROLES_VALIDOS_PERSONA.includes(Number(id_rol))) {
        return res.status(400).json({ ok: false, error: 'id_rol inválido para persona (2 o 3)' });
      }
      cambios.id_rol = Number(id_rol);
    }

    const persona = await actualizarPersona(Number(id), cambios);

    return res.status(200).json({
      ok: true,
      mensaje: 'Perfil de persona actualizado exitosamente',
      persona,
    });
  } catch (error) {
    next(error);
  }
}