// Tipos de usuario, empresa y subproducto usados en la app

import type { UnidadVolumen } from "@/lib/constants";

// Estos tipos reflejan /docs/api-contract.md. Si el backend define una forma distinta,
// actualiza ambos archivos en el mismo cambio.

export type Usuario = {
  id: string;
  email: string;
  fecha_registro: string;
  nombre?: string;
  id_empresa?: string | number | null;
};

export type Empresa = {
  id: string;
  id_usuario: string | number;
  nombre: string;
  nit: string;
  id_municipio: number;
  id_rol: number;
};

export type Subproducto = {
  id: string;
  id_empresa: string;
  nombre: string;
  descripcion?: string;
  id_familia: string;
  id_municipio?: number;
  id_unidad_medida?: number;
  volumen_disponible: number;
  unidad_volumen: UnidadVolumen;
  municipio: string;
  estado_publicacion: "borrador" | "publicado";
  disponible: boolean;
  id_estado_publicacion?: number;
};

export type SubproductoCatalogo = {
  id: string;
  id_empresa: string;
  nombre: string;
  familia: string;
  id_familia: string;
  id_municipio?: number;
  id_unidad_medida?: number;
  volumen_disponible: number;
  unidad_volumen: UnidadVolumen;
  empresa: string;
  usuario?: string;
  municipio: string;
  emoji: string;
  image_url?: string;
  destacado?: boolean;
  disponible?: boolean;
  estado_publicacion?: "borrador" | "publicado";
  id_estado_publicacion?: number;
};

export type SubproductoDetalle = SubproductoCatalogo & {
  descripcion: string;
  condiciones: string;
  frecuencia?: string;
  fecha_publicacion?: string;
  medio_contacto?: string;
  disponible?: boolean;
};

