import type { Empresa, SubproductoCatalogo, SubproductoDetalle, Usuario } from "@/types";
import { FAMILIAS_MATERIAL, MUNICIPIOS_VALLE_ABURRA, UNIDADES_VOLUMEN, type UnidadVolumen } from "@/lib/constants";

// Punto único de acceso a datos que interactúa directamente con la API backend en la nube / local.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

type ApiResponse<T> = {
  ok: boolean;
  error?: string;
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
};

const UNIDAD_POR_ID: Record<number, UnidadVolumen> = { 1: "kg", 2: "ton", 3: "m3" };

function municipioId(nombre: string): number {
  const id = MUNICIPIOS_VALLE_ABURRA.indexOf(nombre) + 1;
  if (id < 1) throw new Error(`Municipio no válido: ${nombre}`);
  return id;
}

function municipioNombre(id: number): string {
  return MUNICIPIOS_VALLE_ABURRA[id - 1] || `Municipio ${id}`;
}

type BackendSubproductoWithEmpresa = BackendSubproducto & { empresa?: string; municipio?: string; familia?: string; unidad_volumen?: string };

function mapSubproducto(item: BackendSubproductoWithEmpresa): SubproductoDetalle {
  const familia = item.familia || FAMILIAS_MATERIAL.find((option) => option.id === String(item.id_familia_material))?.nombre || "Familia desconocida";
  const municipio = item.municipio || municipioNombre(item.id_municipio ?? 0);
  const unidad_volumen = (item.unidad_volumen as typeof UNIDAD_POR_ID[number]) || UNIDAD_POR_ID[item.id_unidad_medida ?? 0] || "kg";
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
    unidad_volumen: unidad_volumen as import("@/lib/constants").UnidadVolumen,
    volumen_disponible: Number(item.volumen_disponible),
    empresa: item.empresa || "Empresa",
    condiciones: "",
    estado_publicacion: item.id_estado_publicacion === 2 ? "publicado" : "borrador",
    id_estado_publicacion: item.id_estado_publicacion,
    disponible: item.disponible,
    fecha_publicacion: item.fecha_registro,
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
}): Promise<{ usuario: Usuario; empresa?: Empresa | null; persona?: unknown }> {
  const response = await post<ApiResponse<{ usuario: Usuario; empresa?: Empresa | null; persona?: unknown }>>("/usuarios/login", input);
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
  cedula: string;
  id_municipio: number;
  id_rol: number;
}): Promise<{ id: number; nombre: string; id_usuario: number }> {
  const response = await post<ApiResponse<{ id: number; nombre: string; id_usuario: number }>>("/personas", input);
  return unwrap(response, "persona");
}

export async function registrarSubproducto(
  input: {
    id_empresa: string | number;
    nombre: string;
    descripcion?: string;
    id_familia: string;
    volumen_disponible: number;
    unidad_volumen: UnidadVolumen;
    municipio: string;
    image_url?: string;
  }
): Promise<SubproductoDetalle> {
  const unidad = UNIDADES_VOLUMEN.find((option) => option.value === input.unidad_volumen);
  if (!unidad) throw new Error("La unidad de medida no es válida.");
  const response = await post<ApiResponse<BackendSubproducto>>("/subproductos", {
    id_empresa: Number(input.id_empresa),
    nombre: input.nombre,
    descripcion: input.descripcion,
    id_familia_material: Number(input.id_familia),
    volumen_disponible: input.volumen_disponible,
    id_unidad_medida: unidad.id,
    id_municipio: municipioId(input.municipio),
    image_base64: input.image_url,
  });
  return mapSubproducto(unwrap(response, "subproducto"));
}

export async function getCatalogo(params?: {
  query?: string;
  id_familia?: string;
  municipio?: string;
}): Promise<SubproductoCatalogo[]> {
  const queryParams = new URLSearchParams();
  if (params?.query) queryParams.set("q", params.query);
  if (params?.id_familia) queryParams.set("id_familia_material", params.id_familia);
  if (params?.municipio) queryParams.set("id_municipio", String(municipioId(params.municipio)));
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
  id_empresa: string | number,
  input: Partial<Pick<SubproductoDetalle, "nombre" | "descripcion" | "volumen_disponible" | "image_url" | "disponible">> & { image_base64?: string }
): Promise<SubproductoDetalle> {
  const { image_url, image_base64, ...rest } = input;
  const response = await fetch(`${API_BASE_URL}/subproductos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_empresa: Number(id_empresa),
      ...rest,
      ...(image_base64 ? { image_base64 } : image_url ? { foto_url: image_url } : {}),
    }),
  });
  const body = await response.json() as ApiResponse<BackendSubproducto>;
  if (!response.ok) throw new Error(body.error || "No se pudo actualizar el subproducto.");
  return mapSubproducto(unwrap(body, "subproducto"));
}

export async function eliminarSubproducto(id: string, id_empresa: string | number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/subproductos/${id}?id_empresa=${encodeURIComponent(String(id_empresa))}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo eliminar el subproducto.");
  }
}

export async function cambiarEstadoPublicacion(
  id: string,
  id_empresa: string | number,
  publicar: boolean,
): Promise<SubproductoDetalle> {
  const response = await fetch(`${API_BASE_URL}/subproductos/${id}/publicar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_empresa: Number(id_empresa), publicar }),
  });
  const body = await response.json() as ApiResponse<BackendSubproducto>;
  if (!response.ok) throw new Error(body.error || "No se pudo cambiar el estado de publicación.");
  return mapSubproducto(unwrap(body, "subproducto"));
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

