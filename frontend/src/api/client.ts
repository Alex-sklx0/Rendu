import type { Empresa, Subproducto, SubproductoCatalogo, SubproductoDetalle, Usuario } from "@/types";
import { FAMILIAS_MATERIAL } from "@/lib/constants";

// Punto único de acceso a datos que interactúa directamente con la API backend en la nube / local.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

type ApiResponse<T> = {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
} & T;

type BackendSubproducto = Omit<SubproductoDetalle, "image_url"> & { foto_url?: string | null };

function mapSubproducto(item: BackendSubproducto): SubproductoDetalle {
  const familia = item.familia || FAMILIAS_MATERIAL.find((option) => option.id === item.id_familia)?.nombre || item.id_familia;
  const empresa = typeof item.empresa === "object" && item.empresa !== null
    ? (item.empresa as { nombre?: string }).nombre || "Empresa"
    : item.empresa;
  return {
    ...item,
    familia,
    empresa,
    image_url: item.foto_url ?? undefined,
    emoji: "",
  };
}

function unwrap<T>(response: ApiResponse<T>, key: string): T {
  if (!response.ok) throw new Error(response.error || "La API devolvió un error.");
  const value = response[key];
  if (value === undefined) throw new Error(`La API no devolvió la propiedad '${key}'.`);
  return value as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Error ${res.status} al llamar ${path}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Error ${res.status} al llamar ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function registrarUsuario(input: {
  email: string;
  password: string;
}): Promise<Usuario> {
  const response = await post<ApiResponse<Usuario>>("/usuarios", input);
  return unwrap(response, "usuario");
}

export async function loginUsuario(input: {
  email: string;
  password: string;
}): Promise<{ usuario: Usuario & { id_empresa?: string; nombre?: string }; empresa?: Empresa }> {
  const response = await post<ApiResponse<{ usuario: Usuario & { id_empresa?: string; nombre?: string }; empresa?: Empresa }>>("/usuarios/login", input);
  if (!response.ok) throw new Error(response.error || "Error al iniciar sesión.");
  return { usuario: response.usuario, empresa: response.empresa };
}

export async function registrarEmpresa(input: Omit<Empresa, "id">): Promise<Empresa> {
  const response = await post<ApiResponse<Empresa>>("/empresas", input);
  return unwrap(response, "empresa");
}

export async function registrarPersona(input: {
  id_usuario: string | number;
  nombre: string;
  cedula?: string;
  municipio?: string;
  id_municipio?: number;
  tipo_actor?: string;
}): Promise<{ id: number; nombre: string; id_usuario: number }> {
  const response = await post<ApiResponse<{ id: number; nombre: string; id_usuario: number }>>("/personas", input);
  return unwrap(response, "persona");
}

export async function registrarSubproducto(
  input: Omit<Subproducto, "id" | "estado_publicacion" | "disponible"> & { frecuencia?: string; image_url?: string }
): Promise<Subproducto> {
  const response = await post<ApiResponse<Subproducto>>("/subproductos", input);
  return unwrap(response, "subproducto");
}

export async function getCatalogo(params?: {
  query?: string;
  id_familia?: string;
  municipio?: string;
}): Promise<SubproductoCatalogo[]> {
  const queryParams = new URLSearchParams();
  if (params?.query) queryParams.set("q", params.query);
  if (params?.id_familia) queryParams.set("familia", params.id_familia);
  if (params?.municipio) queryParams.set("municipio", params.municipio);
  const qs = queryParams.toString();
  const response = await get<ApiResponse<BackendSubproducto[]>>(`/catalogo${qs ? `?${qs}` : ""}`);
  return unwrap(response, "subproductos").map(mapSubproducto);
}

export async function getSubproductoDetalle(id: string): Promise<SubproductoDetalle> {
  const response = await get<ApiResponse<BackendSubproducto>>(`/subproductos/${id}`);
  return mapSubproducto(unwrap(response, "subproducto"));
}

export async function getMisPublicaciones(id_empresa?: string): Promise<SubproductoDetalle[]> {
  const url = id_empresa ? `/subproductos/mis-publicaciones?id_empresa=${id_empresa}` : "/subproductos/mis-publicaciones";
  const response = await get<ApiResponse<BackendSubproducto[]>>(url);
  return unwrap(response, "publicaciones").map(mapSubproducto);
}

export async function actualizarSubproducto(
  id: string,
  input: Partial<Pick<SubproductoDetalle, "nombre" | "descripcion" | "volumen_disponible" | "unidad_volumen" | "municipio" | "frecuencia" | "image_url" | "disponible">>
): Promise<SubproductoDetalle> {
  const response = await fetch(`${API_BASE_URL}/subproductos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await response.json() as ApiResponse<BackendSubproducto>;
  if (!response.ok) throw new Error(body.error || "No se pudo actualizar el subproducto.");
  return mapSubproducto(unwrap(body, "subproducto"));
}

export async function eliminarSubproducto(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/subproductos/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo eliminar el subproducto.");
  }
}

export async function eliminarCuenta(idUsuario: string | number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo eliminar la cuenta.");
  }
}

