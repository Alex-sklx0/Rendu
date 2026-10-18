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
  id: string | number;
  id_usuario?: string | number;
  nombre: string;
  nit?: string;
  id_municipio: number;
  municipio?: string | null;
  id_rol: number;
  medio_contacto?: string | null;
  id_medio_contacto?: number | null;
  contacto?: string | null;
};

export type MedioContacto = {
  id: number | string;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  icono?: string;
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
  ya_manifeste_interes?: boolean;
  es_mia?: boolean;
  empresa_generadora?: {
    id: number;
    nombre: string;
    id_rol: number;
    municipio: string | null;
  } | null;
};

export type SubproductoDetalle = SubproductoCatalogo & {
  descripcion: string;
  condiciones: string;
  frecuencia?: string;
  fecha_publicacion?: string;
  medio_contacto?: string;
  contacto?: string;
  disponible?: boolean;
};

export type ContactoInfo = {
  empresa: string | null;
  medio: string | null;
  contacto: string | null;
  link: string | null;
  mensaje?: string;
};

export type InteresadoItem = {
  id: number;
  fecha: string;
  publicacion: { id: number; nombre: string };
  interesado: {
    id_usuario: number;
    nombre: string | null;
    email: string | null;
    tipo: "EMPRESA" | "PERSONA" | null;
    id_rol: number | null;
  };
};

export type PerfilSesion = {
  usuario: {
    id: number;
    email: string;
    fecha_registro: string;
    nombre: string;
    id_empresa: number | null;
  };
  tipo: "EMPRESA" | "PERSONA" | null;
  empresa?: Empresa | null;
  persona?: { id: number; nombre: string; id_municipio: number; id_rol: number; municipio?: string } | null;
};

