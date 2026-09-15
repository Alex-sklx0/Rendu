import type { Empresa, Subproducto, SubproductoCatalogo, SubproductoDetalle, Usuario } from "@/types";
import { FAMILIAS_MATERIAL } from "@/lib/constants";
import {
  crearEmpresaMock,
  crearSubproductoMock,
  crearUsuarioMock,
  getCatalogoMock,
  getMisPublicacionesMock,
  getSubproductoDetalleMock,
  actualizarSubproductoMock,
} from "./mockClient";

// Punto único de acceso a datos. Los componentes nunca llaman fetch/mockClient directamente:
// siempre pasan por aquí, así que cuando el backend real esté listo solo se edita este archivo.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";
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
  if (USE_MOCKS) return crearUsuarioMock(input);
  const response = await post<ApiResponse<Usuario>>("/usuarios", input);
  return unwrap(response, "usuario");
}

export async function registrarEmpresa(input: Omit<Empresa, "id">): Promise<Empresa> {
  if (USE_MOCKS) return crearEmpresaMock(input);
  const response = await post<ApiResponse<Empresa>>("/empresas", input);
  return unwrap(response, "empresa");
}

export async function registrarSubproducto(
  input: Omit<Subproducto, "id" | "estado_publicacion" | "disponible"> & { frecuencia?: string; image_url?: string }
): Promise<Subproducto> {
  if (USE_MOCKS) return crearSubproductoMock(input);
  const response = await post<ApiResponse<Subproducto>>("/subproductos", input);
  return unwrap(response, "subproducto");
}

export async function getCatalogo(params?: {
  query?: string;
  id_familia?: string;
  municipio?: string;
}): Promise<SubproductoCatalogo[]> {
  if (USE_MOCKS) {
    return getCatalogoMock(params);
  }
  const queryParams = new URLSearchParams();
  if (params?.query) queryParams.set("q", params.query);
  if (params?.id_familia) queryParams.set("familia", params.id_familia);
  if (params?.municipio) queryParams.set("municipio", params.municipio);
  const qs = queryParams.toString();
  const response = await get<ApiResponse<BackendSubproducto[]>>(`/catalogo${qs ? `?${qs}` : ""}`);
  return unwrap(response, "subproductos").map(mapSubproducto);
}

export async function getSubproductoDetalle(id: string): Promise<SubproductoDetalle> {
  if (USE_MOCKS) {
    return getSubproductoDetalleMock(id);
  }
  const response = await get<ApiResponse<BackendSubproducto>>(`/subproductos/${id}`);
  return mapSubproducto(unwrap(response, "subproducto"));
}

export async function getMisPublicaciones(): Promise<SubproductoDetalle[]> {
  if (USE_MOCKS) {
    return getMisPublicacionesMock();
  }
  const response = await get<ApiResponse<BackendSubproducto[]>>("/subproductos/mis-publicaciones");
  return unwrap(response, "publicaciones").map(mapSubproducto);
}

export async function actualizarSubproducto(
  id: string,
  input: Partial<Pick<SubproductoDetalle, "nombre" | "descripcion" | "volumen_disponible" | "unidad_volumen" | "municipio" | "frecuencia" | "image_url">>
): Promise<SubproductoDetalle> {
  if (USE_MOCKS) {
    return actualizarSubproductoMock(id, input);
  }
  const response = await fetch(`${API_BASE_URL}/subproductos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await response.json() as ApiResponse<BackendSubproducto>;
  if (!response.ok) throw new Error(body.error || "No se pudo actualizar el subproducto.");
  return mapSubproducto(unwrap(body, "subproducto"));
}

