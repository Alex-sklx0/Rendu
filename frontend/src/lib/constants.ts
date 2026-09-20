// Fuente: "Problemática — Proyecto Aplicado en TIC", clasificación según Resolución SSPD
// 20211000650805, y Tabla 1 (Desglose por Municipio del Valle de Aburrá).
// Si esta lista cambia, edítala solo aquí — todos los selectores la consumen desde este archivo.

export type FamiliaMaterial = {
  id: string;
  nombre: string;
};

export const FAMILIAS_MATERIAL: FamiliaMaterial[] = [
  { id: "1", nombre: "Papel y cartón" },
  { id: "2", nombre: "Plásticos" },
  { id: "3", nombre: "Vidrio" },
  { id: "4", nombre: "Metales" },
  { id: "5", nombre: "Textiles" },
  { id: "6", nombre: "Madera" },
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

export type UnidadVolumen = "kg" | "ton" | "m3";

export const UNIDADES_VOLUMEN: { value: UnidadVolumen; label: string; id: number }[] = [
  { value: "kg", label: "Kilogramos (kg)", id: 1 },
  { value: "ton", label: "Toneladas (t)", id: 2 },
  { value: "m3", label: "Metros cúbicos (m³)", id: 3 },
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
