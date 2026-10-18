// Cliente de API para conectar el frontend con el backend Express

import type {
  Empresa,
  MedioContacto,
  SubproductoCatalogo,
  SubproductoDetalle,
  Usuario,
  ContactoInfo,
  InteresadoItem,
  PerfilSesion,
} from "@/types";
import {
  FAMILIAS_MATERIAL,
  MUNICIPIOS_VALLE_ABURRA,
  UNIDADES_VOLUMEN,
  type UnidadVolumen,
} from "@/lib/constants";

// URL base de la API backend
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `${API_URL}/api`;

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Gestion de tokens de autenticacion (JWT)
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("auth_token", token);
  localStorage.setItem("isAuthenticated", "true");
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
  localStorage.removeItem("isAuthenticated");
}

type ApiResponse<T = unknown> = {
  ok: boolean;
  error?: string;
  mensaje?: string;
  [key: string]: unknown;
} & T;

type BackendSubproducto = {
  id: number | string;
  id_empresa: number | string;
  nombre: string;
  descripcion?: string | null;
  id_familia_material: number;
  volumen_disponible: number;
  id_unidad_medida: number;
  id_municipio: number;
  direccion?: string | null;
  foto_url?: string | null;
  fecha_registro?: string;
  disponible: boolean;
  id_estado_publicacion?: number;
  ya_manifeste_interes?: boolean;
  es_mia?: boolean;
  empresa_generadora?: {
    id: number;
    nombre: string;
    id_rol: number;
    municipio: string | null;
  } | null;
};

const UNIDAD_POR_ID: Record<number, UnidadVolumen> = { 1: "kg", 2: "ton", 3: "m3" };

// Obtiene el ID numerico del municipio a partir del nombre (1-10)
export function municipioId(nombre: string): number {
  const id = MUNICIPIOS_VALLE_ABURRA.indexOf(nombre) + 1;
  if (id < 1) throw new Error(`Municipio no válido: ${nombre}`);
  return id;
}

// Obtiene el nombre del municipio a partir de su ID
export function municipioNombre(id: number): string {
  return MUNICIPIOS_VALLE_ABURRA[id - 1] || `Municipio ${id}`;
}

type BackendSubproductoWithEmpresa = BackendSubproducto & {
  empresa?: string;
  municipio?: string;
  familia?: string;
  unidad_volumen?: string;
};

// Mapea los datos del backend al formato usado por los componentes React
export function mapSubproducto(item: BackendSubproductoWithEmpresa): SubproductoDetalle {
  const familia =
    item.familia ||
    FAMILIAS_MATERIAL.find((option) => option.id === String(item.id_familia_material))?.nombre ||
    "Familia desconocida";
  const municipio = item.municipio || municipioNombre(item.id_municipio ?? 0);
  const unidad_volumen =
    (item.unidad_volumen as (typeof UNIDAD_POR_ID)[number]) ||
    UNIDAD_POR_ID[item.id_unidad_medida ?? 0] ||
    "kg";

  return {
    id: String(item.id),
    id_empresa: String(item.id_empresa),
    nombre: item.nombre,
    descripcion: item.descripcion || "",
    familia,
    id_familia: String(item.id_familia_material),
    id_municipio: item.id_municipio,
    municipio,
    id_unidad_medida: item.id_unidad_medida,
    unidad_volumen: unidad_volumen as UnidadVolumen,
    volumen_disponible: Number(item.volumen_disponible),
    empresa: item.empresa || item.empresa_generadora?.nombre || "Empresa",
    condiciones: "",
    estado_publicacion: item.id_estado_publicacion === 2 ? "publicado" : "borrador",
    id_estado_publicacion: item.id_estado_publicacion,
    disponible: item.disponible,
    fecha_publicacion: item.fecha_registro,
    image_url: item.foto_url ?? undefined,
    emoji: "",
    ya_manifeste_interes: item.ya_manifeste_interes ?? false,
    es_mia: item.es_mia ?? false,
    empresa_generadora: item.empresa_generadora ?? null,
  };
}

// Desempaqueta la respuesta verificando el flag ok
function unwrap<T, K extends keyof T>(response: ApiResponse<T>, key: K): T[K] {
  if (!response.ok) throw new ApiError(response.error || "La API devolvió un error.", 400);
  const value = response[key];
  if (value === undefined || value === null) {
    throw new ApiError(`La API no devolvió la propiedad '${String(key)}'.`, 500);
  }
  return value as T[K];
}

// Cliente HTTP principal con interceptor de peticion y respuesta
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Interceptor: 401 Unauthorized -> limpiar sesion y redirigir
  if (res.status === 401) {
    clearSession();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    let errorMsg = "Sesión vencida. Inicia sesión de nuevo.";
    try {
      const data = await res.json();
      if (data?.error) errorMsg = data.error;
    } catch {
      // Ignorar
    }
    throw new ApiError(errorMsg, 401);
  }

  // Parsear body
  let body: any = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    body = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => "");
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = { error: text };
      }
    }
  }

  if (!res.ok) {
    const message = body?.error || body?.message || `Error ${res.status} al procesar la solicitud.`;
    throw new ApiError(message, res.status, body);
  }

  return body as T;
}

// ----------------------------------------------------------------------
// 1. USUARIOS Y AUTENTICACION
// ----------------------------------------------------------------------

// Registro de usuario inicial -> devuelve usuario y token
export async function registrarUsuario(input: {
  email: string;
  password: string;
}): Promise<Usuario> {
  const response = await request<ApiResponse<{ usuario: Usuario; token?: string }>>("/usuarios", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (response.token) {
    setToken(response.token);
  }
  return unwrap(response, "usuario");
}

// Inicio de sesion -> devuelve token, usuario, empresa o persona
export async function loginUsuario(input: {
  email: string;
  password: string;
}): Promise<{
  usuario: Usuario;
  empresa?: Empresa | null;
  persona?: { id: number; nombre: string; id_municipio: number; id_rol: number } | null;
  token?: string;
}> {
  const response = await request<
    ApiResponse<{
      usuario: Usuario;
      empresa?: Empresa | null;
      persona?: { id: number; nombre: string; id_municipio: number; id_rol: number } | null;
      token?: string;
    }>
  >("/usuarios/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (response.token) {
    setToken(response.token);
  }

  // Guardar sesion localmente de forma uniforme
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: response.usuario.id,
        email: response.usuario.email,
        nombre: response.usuario.nombre || response.empresa?.nombre || input.email.split("@")[0],
        id_empresa: response.usuario.id_empresa ?? response.empresa?.id ?? null,
        tipo: response.empresa ? "EMPRESA" : response.persona ? "PERSONA" : null,
        municipio:
          MUNICIPIOS_VALLE_ABURRA[
            (response.empresa?.id_municipio ?? response.persona?.id_municipio ?? 0) - 1
          ],
      })
    );
  }

  return {
    usuario: response.usuario,
    empresa: response.empresa,
    persona: response.persona,
    token: response.token,
  };
}

// Restaurar sesion completa de la cuenta actual
export async function getMe(): Promise<PerfilSesion> {
  const response = await request<ApiResponse<PerfilSesion>>("/usuarios/me", {
    method: "GET",
  });

  if (typeof window !== "undefined" && response.usuario) {
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: response.usuario.id,
        email: response.usuario.email,
        nombre:
          response.usuario.nombre ||
          response.empresa?.nombre ||
          response.persona?.nombre ||
          response.usuario.email.split("@")[0],
        id_empresa: response.usuario.id_empresa ?? response.empresa?.id ?? null,
        tipo: response.tipo,
        municipio:
          response.empresa?.municipio ||
          response.persona?.municipio ||
          MUNICIPIOS_VALLE_ABURRA[
            (response.empresa?.id_municipio ?? response.persona?.id_municipio ?? 0) - 1
          ],
      })
    );
    localStorage.setItem("isAuthenticated", "true");
  }

  return response;
}

// Eliminar la cuenta del usuario autenticado
export async function eliminarCuenta(idUsuario: string | number): Promise<void> {
  await request<ApiResponse<{ mensaje: string }>>(`/usuarios/${idUsuario}`, {
    method: "DELETE",
  });
  clearSession();
}

// ----------------------------------------------------------------------
// 2. PERFILES (EMPRESAS Y PERSONAS)
// ----------------------------------------------------------------------

// Registro de empresa (id_usuario se toma del token Bearer en el backend)
export async function registrarEmpresa(input: {
  nombre: string;
  nit: string;
  id_municipio: number;
  id_rol: number;
  contacto?: string | null;
  id_medio_contacto?: number | null;
  id_usuario?: string | number; // Ignorado por el backend si hay token
}): Promise<Empresa> {
  const { id_usuario: _omit, ...body } = input;
  const response = await request<ApiResponse<{ empresa: Empresa }>>("/empresas", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return unwrap(response, "empresa");
}

// Actualizar medio de contacto de una empresa
export async function actualizarContactoEmpresa(
  id_empresa: string | number,
  input: { contacto: string; id_medio_contacto?: number; medio_contacto?: string }
): Promise<Empresa> {
  const response = await request<ApiResponse<{ empresa: Empresa }>>(
    `/empresas/${id_empresa}/contacto`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
  return unwrap(response, "empresa");
}

// Registro de persona natural o reciclador (id_usuario sale del token)
export async function registrarPersona(input: {
  nombre: string;
  cedula: string;
  id_municipio: number;
  id_rol: number;
  id_usuario?: string | number;
}): Promise<{ id: number; nombre: string; id_usuario: number }> {
  const { id_usuario: _omit, ...body } = input;
  const response = await request<
    ApiResponse<{ persona: { id: number; nombre: string; id_usuario: number } }>
  >("/personas", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return unwrap(response, "persona");
}

// Consulta de medios de contacto disponibles
export async function getMediosContacto(): Promise<MedioContacto[]> {
  try {
    const response = await request<any>("/medios-contacto", { method: "GET" });
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.medios_contacto)) return response.medios_contacto;
    if (response && Array.isArray(response.medios)) return response.medios;
    if (response && Array.isArray(response.data)) return response.data;
  } catch {
    // Si el backend no tiene ruta de medios, usar las constantes locales oficiales
  }
  return [
    { id: 1, nombre: "WhatsApp", descripcion: "Número celular o enlace directo de chat" },
    { id: 2, nombre: "Correo", descripcion: "Dirección de correo corporativo para solicitudes" },
    { id: 3, nombre: "Teléfono", descripcion: "Número de teléfono fijo o móvil corporativo" },
    { id: 4, nombre: "Instagram", descripcion: "Perfil de empresa (@usuario) o enlace directo" },
  ];
}

// ----------------------------------------------------------------------
// 3. CATALOGO Y PUBLICACIONES PUBLICAS
// ----------------------------------------------------------------------

// Consulta de subproductos para el catalogo publico
// Soporta busqueda q, varias familias separadas por coma, y municipio
export async function getCatalogo(params?: {
  query?: string;
  id_familia?: string | string[];
  municipio?: string;
}): Promise<SubproductoCatalogo[]> {
  const queryParams = new URLSearchParams();
  if (params?.query) queryParams.set("q", params.query.trim());

  if (params?.id_familia) {
    const fams = Array.isArray(params.id_familia)
      ? params.id_familia.join(",")
      : String(params.id_familia);
    if (fams) queryParams.set("familias", fams);
  }

  if (params?.municipio && params.municipio !== "todos") {
    queryParams.set("municipio", String(municipioId(params.municipio)));
  }

  const qs = queryParams.toString();
  const response = await request<
    ApiResponse<{
      total: number;
      mensaje?: string;
      subproductos: BackendSubproductoWithEmpresa[];
    }>
  >(`/catalogo${qs ? `?${qs}` : ""}`, { method: "GET" });

  const rawList = response.subproductos || [];
  return rawList.map(mapSubproducto);
}

// Consulta de catalogo con total y mensaje del backend cuando total === 0
export async function getCatalogoDetallado(params?: {
  query?: string;
  id_familia?: string | string[];
  municipio?: string;
}): Promise<{ total: number; mensaje?: string; subproductos: SubproductoCatalogo[] }> {
  const queryParams = new URLSearchParams();
  if (params?.query) queryParams.set("q", params.query.trim());

  if (params?.id_familia) {
    const fams = Array.isArray(params.id_familia)
      ? params.id_familia.join(",")
      : String(params.id_familia);
    if (fams) queryParams.set("familias", fams);
  }

  if (params?.municipio && params.municipio !== "todos") {
    queryParams.set("municipio", String(municipioId(params.municipio)));
  }

  const qs = queryParams.toString();
  const response = await request<
    ApiResponse<{
      total: number;
      mensaje?: string;
      subproductos: BackendSubproductoWithEmpresa[];
    }>
  >(`/catalogo${qs ? `?${qs}` : ""}`, { method: "GET" });

  const rawList = response.subproductos || [];
  return {
    total: response.total ?? rawList.length,
    mensaje: response.mensaje,
    subproductos: rawList.map(mapSubproducto),
  };
}

// Consulta detallada publica de una publicacion (HU-16)
export async function getPublicacion(id: string | number): Promise<SubproductoDetalle> {
  const response = await request<ApiResponse<{ publicacion: BackendSubproductoWithEmpresa }>>(
    `/publicaciones/${id}`,
    { method: "GET" }
  );
  return mapSubproducto(unwrap(response, "publicacion"));
}

// ----------------------------------------------------------------------
// 4. SUBPRODUCTOS (PANEL DE EMPRESA)
// ----------------------------------------------------------------------

// Creacion de un nuevo subproducto (id_empresa se extrae del token en el backend)
export async function registrarSubproducto(input: {
  nombre: string;
  descripcion?: string;
  id_familia: string;
  volumen_disponible: number;
  unidad_volumen: UnidadVolumen;
  municipio: string;
  image_url?: string;
  publicar?: boolean;
  id_empresa?: string | number; // Opcional, ignorado si hay token
}): Promise<SubproductoDetalle> {
  const unidad = UNIDADES_VOLUMEN.find((option) => option.value === input.unidad_volumen);
  if (!unidad) throw new Error("La unidad de medida no es válida.");

  const response = await request<ApiResponse<{ subproducto: BackendSubproductoWithEmpresa }>>(
    "/subproductos",
    {
      method: "POST",
      body: JSON.stringify({
        nombre: input.nombre,
        descripcion: input.descripcion,
        id_familia_material: Number(input.id_familia),
        volumen_disponible: input.volumen_disponible,
        id_unidad_medida: unidad.id,
        id_municipio: municipioId(input.municipio),
        image_base64: input.image_url,
      }),
    }
  );

  let creado = mapSubproducto(unwrap(response, "subproducto"));

  // Si se indico publicar inmediatamente, cambiar el estado
  if (input.publicar) {
    creado = await cambiarEstadoPublicacion(creado.id, true);
  }

  return creado;
}

// Consulta de detalle para el dueno del subproducto
export async function getSubproductoDetalle(id: string | number): Promise<SubproductoDetalle> {
  const response = await request<ApiResponse<{ subproducto: BackendSubproductoWithEmpresa }>>(
    `/subproductos/${id}`,
    { method: "GET" }
  );
  return mapSubproducto(unwrap(response, "subproducto"));
}

// Obtener las publicaciones propias de la empresa conectada
export async function getMisPublicaciones(_id_empresa?: string | number): Promise<SubproductoDetalle[]> {
  const response = await request<
    ApiResponse<{ publicaciones: BackendSubproductoWithEmpresa[] }>
  >("/subproductos/mis-publicaciones", { method: "GET" });

  const rawList = response.publicaciones || [];
  return rawList.map(mapSubproducto);
}

// Actualizar datos de un subproducto propio
export async function actualizarSubproducto(
  id: string | number,
  arg2:
    | (Partial<
        Pick<
          SubproductoDetalle,
          "nombre" | "descripcion" | "volumen_disponible" | "image_url" | "disponible"
        >
      > & { image_base64?: string; id_empresa?: string | number })
    | (string | number),
  arg3?: Partial<
    Pick<
      SubproductoDetalle,
      "nombre" | "descripcion" | "volumen_disponible" | "image_url" | "disponible"
    >
  > & { image_base64?: string; id_empresa?: string | number }
): Promise<SubproductoDetalle> {
  const input = (typeof arg2 === "object" ? arg2 : arg3) || {};
  const { image_url, image_base64, id_empresa: _omit, ...rest } = input;

  const response = await request<ApiResponse<{ subproducto: BackendSubproductoWithEmpresa }>>(
    `/subproductos/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        ...rest,
        ...(image_base64 ? { image_base64 } : image_url ? { foto_url: image_url } : {}),
      }),
    }
  );

  return mapSubproducto(unwrap(response, "subproducto"));
}

// Eliminar un subproducto propio (cascada automatica en backend)
export async function eliminarSubproducto(id: string | number, _id_empresa?: string | number): Promise<void> {
  await request<ApiResponse<{ mensaje: string }>>(`/subproductos/${id}`, {
    method: "DELETE",
  });
}

// Cambiar el estado de publicacion (publicar o borrador)
export async function cambiarEstadoPublicacion(
  id: string | number,
  arg2: boolean | (string | number),
  arg3?: boolean
): Promise<SubproductoDetalle> {
  const publicar = typeof arg2 === "boolean" ? arg2 : Boolean(arg3);
  const response = await request<ApiResponse<{ subproducto: BackendSubproductoWithEmpresa }>>(
    `/subproductos/${id}/publicar`,
    {
      method: "PATCH",
      body: JSON.stringify({ publicar }),
    }
  );
  return mapSubproducto(unwrap(response, "subproducto"));
}

// ----------------------------------------------------------------------
// 5. MANIFESTACIONES DE INTERES Y CONTACTO (HU-17, HU-18, HU-19)
// ----------------------------------------------------------------------

// Manifestar interes en una publicacion (HU-17)
export async function manifestarInteres(
  id_publicacion: number | string
): Promise<{ interes: unknown; contacto: ContactoInfo }> {
  try {
    const response = await request<
      ApiResponse<{ interes: unknown; contacto: ContactoInfo }>
    >("/interes", {
      method: "POST",
      body: JSON.stringify({ id_publicacion: Number(id_publicacion) }),
    });

    return {
      interes: response.interes,
      contacto: response.contacto,
    };
  } catch (err) {
    // Si ya habia manifestado interes (409), consultar el contacto directamente
    if (err instanceof ApiError && err.status === 409) {
      const contacto = await getContactoInteres(id_publicacion);
      return { interes: null, contacto };
    }
    throw err;
  }
}

// Obtener el link de contacto ya formateado para una publicacion (HU-19)
export async function getContactoInteres(
  id_publicacion: number | string
): Promise<ContactoInfo> {
  const response = await request<ApiResponse<{ contacto: ContactoInfo }>>(
    `/interes/contacto?id_publicacion=${encodeURIComponent(String(id_publicacion))}`,
    { method: "GET" }
  );
  return unwrap(response, "contacto");
}

// Listar los interesados en las publicaciones de mi empresa (HU-18)
export async function getInteresados(
  id_publicacion?: number | string
): Promise<{ total: number; mensaje?: string; interesados: InteresadoItem[] }> {
  const query = id_publicacion ? `?id_publicacion=${encodeURIComponent(String(id_publicacion))}` : "";
  const response = await request<
    ApiResponse<{
      total: number;
      mensaje?: string;
      interesados: InteresadoItem[];
    }>
  >(`/mis-publicaciones/interesados${query}`, { method: "GET" });

  return {
    total: response.total ?? (response.interesados?.length || 0),
    mensaje: response.mensaje,
    interesados: response.interesados || [],
  };
}
