// Fuente: "Problemática — Proyecto Aplicado en TIC", clasificación según Resolución SSPD
// 20211000650805, y Tabla 1 (Desglose por Municipio del Valle de Aburrá).
// Si esta lista cambia, edítala solo aquí — todos los selectores la consumen desde este archivo.

export type FamiliaMaterial = {
  id: string;
  nombre: string;
};

export const FAMILIAS_MATERIAL: FamiliaMaterial[] = [
  { id: "papel_carton", nombre: "Papel y cartón" },
  { id: "plasticos", nombre: "Plásticos" },
  { id: "vidrio", nombre: "Vidrio" },
  { id: "metales", nombre: "Metales" },
  { id: "textil", nombre: "Textil" },
  { id: "madera", nombre: "Madera" },
];

export const MUNICIPIOS_VALLE_ABURRA: string[] = [
  "Medellín",
  "Bello",
  "Itagüí",
  "Envigado",
  "Sabaneta",
  "Copacabana",
  "Barbosa",
  "Caldas",
  "La Estrella",
  "Girardota",
];

export type UnidadVolumen = "kg" | "ton" | "m3" | "unidades";

export const UNIDADES_VOLUMEN: { value: UnidadVolumen; label: string }[] = [
  { value: "kg", label: "Kilogramos (kg)" },
  { value: "ton", label: "Toneladas (ton)" },
  { value: "m3", label: "Metros cúbicos (m³)" },
  { value: "unidades", label: "Unidades" },
];

export type TipoActor =
  | "empresa_generadora"
  | "empresa_transformadora"
  | "eca"
  | "reciclador";

export const TIPOS_ACTOR: { value: TipoActor; label: string }[] = [
  { value: "empresa_generadora", label: "Empresa generadora" },
  { value: "empresa_transformadora", label: "Empresa transformadora" },
  { value: "eca", label: "Estación de Clasificación y Aprovechamiento (ECA)" },
  { value: "reciclador", label: "Reciclador / gestor autorizado" },
];
