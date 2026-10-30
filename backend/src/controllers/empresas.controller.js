import {
  registrarEmpresa,
  actualizarContactoEmpresa,
  actualizarEmpresa,
  MUNICIPIOS_VALIDOS,
  ROLES_VALIDOS_EMPRESA,
} from '../services/empresas.service.js';
import { resolverIdUsuario, resolverIdEmpresa } from '../middlewares/auth.js';
import { limpiarTexto } from '../middlewares/validaciones.js';

export async function postRegistrarEmpresa(req, res, next) {
  try {
    const body = req.body ?? {};
    const { nit, id_municipio, id_rol, id_medio_contacto } = body;
    const nombre = limpiarTexto(body.nombre, 150);
    const contacto = limpiarTexto(body.contacto, 255);
    // El usuario sale siempre del token; si el cliente manda otro id_usuario, 403
    const id_usuario = resolverIdUsuario(req, body.id_usuario);

    if (!nombre || !nit || !id_municipio || !id_rol) {
      return res.status(400).json({
        ok: false,
        error: 'Los campos "nombre", "nit", "id_municipio" e "id_rol" son obligatorios',
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

    if (id_medio_contacto !== undefined && id_medio_contacto !== null) {
      if (!/^\d+$/.test(String(id_medio_contacto))) {
        return res.status(400).json({
          ok: false,
          error: 'id_medio_contacto debe ser numérico',
        });
      }
    }

    const empresa = await registrarEmpresa({
      nombre,
      nit: String(nit).trim(),
      id_municipio: Number(id_municipio),
      id_rol: Number(id_rol),
      id_usuario: Number(id_usuario),
      contacto: contacto || null,
      id_medio_contacto: id_medio_contacto ? Number(id_medio_contacto) : null,
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

export async function patchContactoEmpresa(req, res, next) {
  try {
    const { id } = req.params;
    const { contacto, id_medio_contacto } = req.body ?? {};
    const id_empresa = resolverIdEmpresa(req, id);

    if (!contacto || !id_medio_contacto) {
      return res.status(400).json({
        ok: false,
        error: 'Los campos "contacto" e "id_medio_contacto" son obligatorios',
      });
    }

    const empresa = await actualizarContactoEmpresa(Number(id_empresa), {
      contacto: String(contacto).trim(),
      id_medio_contacto: Number(id_medio_contacto),
    });

    return res.status(200).json({
      ok: true,
      mensaje: 'Contacto de empresa actualizado exitosamente',
      empresa,
    });
  } catch (error) {
    next(error);
  }
}

export async function putActualizarEmpresa(req, res, next) {
  try {
    const { id } = req.params;
    const id_empresa = resolverIdEmpresa(req, id);

    const { nombre, nit, id_municipio, id_rol, contacto, id_medio_contacto } = req.body ?? {};
    const cambios = {};

    if (nombre !== undefined) cambios.nombre = limpiarTexto(nombre, 150);
    if (nit !== undefined) cambios.nit = String(nit).trim();
    if (id_municipio !== undefined) {
      if (!MUNICIPIOS_VALIDOS.includes(Number(id_municipio))) {
        return res.status(400).json({ ok: false, error: 'id_municipio inválido (1 a 10)' });
      }
      cambios.id_municipio = Number(id_municipio);
    }
    if (id_rol !== undefined) {
      if (!ROLES_VALIDOS_EMPRESA.includes(Number(id_rol))) {
        return res.status(400).json({ ok: false, error: 'id_rol inválido para empresa (1 o 2)' });
      }
      cambios.id_rol = Number(id_rol);
    }
    if (contacto !== undefined) cambios.contacto = contacto ? limpiarTexto(contacto, 255) : null;
    if (id_medio_contacto !== undefined) cambios.id_medio_contacto = id_medio_contacto ? Number(id_medio_contacto) : null;

    const empresa = await actualizarEmpresa(Number(id_empresa), cambios);

    return res.status(200).json({
      ok: true,
      mensaje: 'Perfil de empresa actualizado exitosamente',
      empresa,
    });
  } catch (error) {
    next(error);
  }
}