import type { Empresa, Subproducto, SubproductoCatalogo, SubproductoDetalle, Usuario } from "@/types";
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

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
  return USE_MOCKS ? crearUsuarioMock(input) : post<Usuario>("/usuarios", input);
}

export async function registrarEmpresa(input: Omit<Empresa, "id">): Promise<Empresa> {
  return USE_MOCKS ? crearEmpresaMock(input) : post<Empresa>("/empresas", input);
}

export async function registrarSubproducto(
  input: Omit<Subproducto, "id" | "estado_publicacion" | "disponible"> & { frecuencia?: string; image_url?: string }
): Promise<Subproducto> {
  return USE_MOCKS
    ? crearSubproductoMock(input)
    : post<Subproducto>("/subproductos", input);
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
  return get<SubproductoCatalogo[]>(`/catalogo${qs ? `?${qs}` : ""}`);
}

export async function getSubproductoDetalle(id: string): Promise<SubproductoDetalle> {
  if (USE_MOCKS) {
    return getSubproductoDetalleMock(id);
  }
  return get<SubproductoDetalle>(`/subproductos/${id}`);
}

export async function getMisPublicaciones(): Promise<SubproductoDetalle[]> {
  if (USE_MOCKS) {
    return getMisPublicacionesMock();
  }
  return get<SubproductoDetalle[]>("/subproductos/mis-publicaciones");
}

export async function actualizarSubproducto(
  id: string,
  input: Partial<Pick<SubproductoDetalle, "nombre" | "descripcion" | "volumen_disponible" | "unidad_volumen" | "municipio" | "frecuencia" | "image_url">>
): Promise<SubproductoDetalle> {
  if (USE_MOCKS) {
    return actualizarSubproductoMock(id, input);
  }
  return fetch(`${API_BASE_URL}/subproductos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then(async (res) => {
    if (!res.ok) throw new Error("No se pudo actualizar el subproducto.");
    return res.json() as Promise<SubproductoDetalle>;
  });
}

