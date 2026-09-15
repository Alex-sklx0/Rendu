import type { Empresa, Subproducto, Usuario } from "@/types";
import { crearEmpresaMock, crearSubproductoMock, crearUsuarioMock } from "./mockClient";

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
  input: Omit<Subproducto, "id" | "estado_publicacion" | "disponible">
): Promise<Subproducto> {
  return USE_MOCKS
    ? crearSubproductoMock(input)
    : post<Subproducto>("/subproductos", input);
}
