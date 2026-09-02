import type { Empresa, Subproducto, Usuario } from "@/types";

// Backend simulado para desarrollo mientras los servicios reales (Carolina) no existen.
// Guarda todo en localStorage para que sobreviva a un refresh durante una demo.
// Ver docs/api-contract.md para las formas reales que esto imita.

const LATENCY_MS = 350;
const STORAGE_KEY = "rendu_mock_db";

type MockDB = {
  usuarios: Usuario[];
  empresas: Empresa[];
  subproductos: Subproducto[];
};

function loadDB(): MockDB {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw) as MockDB;
  return { usuarios: [], empresas: [], subproductos: [] };
}

function saveDB(db: MockDB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function id(): string {
  return crypto.randomUUID();
}

export async function crearUsuarioMock(input: {
  email: string;
  password: string;
}): Promise<Usuario> {
  const db = loadDB();
  if (db.usuarios.some((u) => u.email === input.email)) {
    throw new Error("Ya existe una cuenta registrada con este correo.");
  }
  const usuario: Usuario = {
    id: id(),
    email: input.email,
    rol: "usuario",
    fecha_registro: new Date().toISOString(),
  };
  db.usuarios.push(usuario);
  saveDB(db);
  return delay(usuario);
}

export async function crearEmpresaMock(
  input: Omit<Empresa, "id">
): Promise<Empresa> {
  const db = loadDB();
  const empresa: Empresa = { ...input, id: id() };
  db.empresas.push(empresa);
  saveDB(db);
  return delay(empresa);
}

export async function crearSubproductoMock(
  input: Omit<Subproducto, "id" | "estado_publicacion" | "disponible">
): Promise<Subproducto> {
  const db = loadDB();
  const subproducto: Subproducto = {
    ...input,
    id: id(),
    estado_publicacion: "borrador",
    disponible: true,
  };
  db.subproductos.push(subproducto);
  saveDB(db);
  return delay(subproducto);
}
