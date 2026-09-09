import type { Empresa, Subproducto, SubproductoCatalogo, SubproductoDetalle, Usuario } from "@/types";

// Backend simulado para desarrollo mientras los servicios reales (Carolina) no existen.
// Guarda todo en localStorage para que sobreviva a un refresh durante una demo.
// Ver docs/api-contract.md para las formas reales que esto imita.

const LATENCY_MS = 350;
const STORAGE_KEY = "rendu_mock_db";

const DEFAULT_CATALOG: SubproductoDetalle[] = [
  {
    id: "sp-1",
    nombre: "Recortes de algodón",
    familia: "Textil",
    id_familia: "textil",
    volumen_disponible: 250,
    unidad_volumen: "kg",
    empresa: "Fibretex",
    municipio: "Medellín",
    emoji: "🧵",
    descripcion: "Recortes limpios de algodón provenientes del proceso de confección. Disponibles para reutilización o transformación.",
    condiciones: "Entrega en planta · Material seco · Separado por color.",
    frecuencia: "Una vez",
    destacado: true,
  },
  {
    id: "sp-2",
    nombre: "Cartón corrugado",
    familia: "Papel y cartón",
    id_familia: "papel_carton",
    volumen_disponible: 800,
    unidad_volumen: "kg",
    empresa: "Empaques Medellín",
    municipio: "Bello",
    emoji: "📦",
    descripcion: "Cajas y sobrantes de cartón corrugado doble pared, compactado y enfardado.",
    condiciones: "Recogida semanal en bodega principal.",
    frecuencia: "Semanal",
  },
  {
    id: "sp-3",
    nombre: "Envases PET",
    familia: "Plásticos",
    id_familia: "plasticos",
    volumen_disponible: 420,
    unidad_volumen: "kg",
    empresa: "Natuh",
    municipio: "Medellín",
    emoji: "🧴",
    descripcion: "Botellas y recipientes PET transparentes posindustriales, sin etiquetas ni tapas.",
    condiciones: "Limpios y prensados en pacas de 50 kg.",
    frecuencia: "Quincenal",
  },
  {
    id: "sp-4",
    nombre: "Viruta de madera",
    familia: "Madera",
    id_familia: "madera",
    volumen_disponible: 180,
    unidad_volumen: "kg",
    empresa: "Taller Industrial",
    municipio: "Itagüí",
    emoji: "🪵",
    descripcion: "Viruta y aserrín de pino seco, libre de pinturas, barnices o químicos tóxicos.",
    condiciones: "Empacado en costales de 20 kg para fácil transporte.",
    frecuencia: "Semanal",
  },
  {
    id: "sp-5",
    nombre: "Bobinas de papel",
    familia: "Papel y cartón",
    id_familia: "papel_carton",
    volumen_disponible: 300,
    unidad_volumen: "kg",
    empresa: "Gráficas Sur",
    municipio: "Envigado",
    emoji: "📄",
    descripcion: "Retales de papel bond y kraft en tiras de bobinas continuas de impresión.",
    condiciones: "Almacenado bajo techo, seco y limpio.",
    frecuencia: "Una vez",
  },
  {
    id: "sp-6",
    nombre: "Hilos sobrantes",
    familia: "Textil",
    id_familia: "textil",
    volumen_disponible: 95,
    unidad_volumen: "kg",
    empresa: "Riochevi",
    municipio: "Medellín",
    emoji: "🧶",
    descripcion: "Carretes e hilazas de poliéster y algodón remanentes de tintorería.",
    condiciones: "Clasificados por lote y color.",
    frecuencia: "Mensual",
  },
];

type MockDB = {
  usuarios: Usuario[];
  empresas: Empresa[];
  subproductos: Subproducto[];
  catalogo?: SubproductoDetalle[];
};

function loadDB(): MockDB {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw) as MockDB;
    if (!parsed.catalogo || parsed.catalogo.length === 0) {
      parsed.catalogo = [...DEFAULT_CATALOG];
      saveDB(parsed);
    }
    return parsed;
  }
  const initial: MockDB = {
    usuarios: [],
    empresas: [],
    subproductos: [],
    catalogo: [...DEFAULT_CATALOG],
  };
  saveDB(initial);
  return initial;
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
  input: Omit<Subproducto, "id" | "estado_publicacion" | "disponible"> & { frecuencia?: string; image_url?: string }
): Promise<Subproducto> {
  const db = loadDB();
  const newId = id();
  const subproducto: Subproducto = {
    ...input,
    id: newId,
    estado_publicacion: "borrador",
    disponible: true,
  };
  db.subproductos.push(subproducto);

  // También lo indexamos en el catálogo mock para visualización inmediata
  const familiaMap: Record<string, { label: string; emoji: string }> = {
    papel_carton: { label: "Papel y cartón", emoji: "📦" },
    plasticos: { label: "Plásticos", emoji: "🧴" },
    vidrio: { label: "Vidrio", emoji: "🫙" },
    metales: { label: "Metales", emoji: "🔩" },
    textil: { label: "Textil", emoji: "🧵" },
    madera: { label: "Madera", emoji: "🪵" },
  };

  const infoFamilia = familiaMap[input.id_familia] || { label: input.id_familia, emoji: "📦" };

  const itemCatalogo: SubproductoDetalle = {
    id: newId,
    nombre: input.nombre,
    familia: infoFamilia.label,
    id_familia: input.id_familia,
    volumen_disponible: input.volumen_disponible,
    unidad_volumen: input.unidad_volumen,
    empresa: "Mi Empresa",
    municipio: input.municipio,
    emoji: infoFamilia.emoji,
    image_url: input.image_url,
    descripcion: input.descripcion || "Sin descripción proporcionada.",
    condiciones: "Entrega a convenir con la empresa.",
    frecuencia: input.frecuencia || "Una vez",
  };

  if (!db.catalogo) db.catalogo = [];
  db.catalogo.unshift(itemCatalogo);

  saveDB(db);
  return delay(subproducto);
}

export async function getCatalogoMock(params?: {
  query?: string;
  id_familia?: string;
  municipio?: string;
}): Promise<SubproductoCatalogo[]> {
  const db = loadDB();
  let items = db.catalogo ?? DEFAULT_CATALOG;

  if (params?.id_familia && params.id_familia !== "todos") {
    items = items.filter((item) => item.id_familia === params.id_familia);
  }

  if (params?.municipio && params.municipio !== "todos") {
    items = items.filter((item) => item.municipio.toLowerCase() === params.municipio?.toLowerCase());
  }

  if (params?.query && params.query.trim()) {
    const q = params.query.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.nombre.toLowerCase().includes(q) ||
        item.familia.toLowerCase().includes(q) ||
        item.empresa.toLowerCase().includes(q) ||
        item.municipio.toLowerCase().includes(q)
    );
  }

  return delay(items);
}

export async function getSubproductoDetalleMock(id: string): Promise<SubproductoDetalle> {
  const db = loadDB();
  const item = (db.catalogo ?? DEFAULT_CATALOG).find((i) => i.id === id);
  if (!item) {
    throw new Error(`Subproducto con ID "${id}" no encontrado en el catálogo.`);
  }
  return delay(item);
}
export async function getMisPublicacionesMock(): Promise<SubproductoDetalle[]> {
  const db = loadDB();
  return delay(db.catalogo ?? DEFAULT_CATALOG);
}

export async function actualizarSubproductoMock(
  id: string,
  input: Partial<Pick<SubproductoDetalle, "nombre" | "descripcion" | "volumen_disponible" | "unidad_volumen" | "municipio" | "frecuencia" | "image_url">>
): Promise<SubproductoDetalle> {
  const db = loadDB();
  const item = (db.catalogo ?? DEFAULT_CATALOG).find((subproducto) => subproducto.id === id);

  if (!item) {
    throw new Error(`Subproducto con ID "${id}" no encontrado.`);
  }

  Object.assign(item, input);
  const ownSubproducto = db.subproductos.find((subproducto) => subproducto.id === id);
  if (ownSubproducto) {
    Object.assign(ownSubproducto, input);
  }
  saveDB(db);
  return delay(item);
}

