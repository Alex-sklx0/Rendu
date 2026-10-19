import { registrarEmpresa, actualizarContactoEmpresa, MUNICIPIOS_VALIDOS, ROLES_VALIDOS_EMPRESA } from '../services/empresas.service.js';
import { resolverIdUsuario, resolverIdEmpresa } from '../middlewares/auth.js';

export async function postRegistrarEmpresa(req, res, next) {
  try {
    const { nombre, nit, id_municipio, id_rol, contacto, id_medio_contacto } = req.body;
    // Con token, el usuario sale del token; sin token, del body (modo compatible)
    const id_usuario = resolverIdUsuario(req, req.body.id_usuario);

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

    // Contacto opcional, pero si se envía uno deben venir los dos
    const tieneContacto = contacto !== undefined && contacto !== null && String(contacto).trim() !== '';
    const tieneMedio = id_medio_contacto !== undefined && id_medio_contacto !== null && id_medio_contacto !== '';
    if (tieneContacto !== tieneMedio) {
      return res.status(400).json({
        ok: false,
        error: 'Si indicas "contacto" también debes indicar "id_medio_contacto" (y viceversa)',
      });
    }
    if (tieneMedio && !/^\d+$/.test(String(id_medio_contacto))) {
      return res.status(400).json({ ok: false, error: 'id_medio_contacto debe ser numérico' });
    }

    const empresa = await registrarEmpresa({
      nombre,
      nit,
      id_municipio: Number(id_municipio),
      id_rol: Number(id_rol),
      id_usuario: Number(id_usuario),
      contacto: tieneContacto ? String(contacto).trim() : null,
      id_medio_contacto: tieneMedio ? Number(id_medio_contacto) : null,
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
    const { contacto, id_medio_contacto } = req.body;
    const id_empresa = resolverIdEmpresa(req, id);

    if (!id_empresa) {
      return res.status(400).json({ ok: false, error: 'id_empresa es requerido' });
    }

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