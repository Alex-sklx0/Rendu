import type { TipoActor, UnidadVolumen } from "@/lib/constants";

// Estos tipos reflejan /docs/api-contract.md. Si el backend define una forma distinta,
// actualiza ambos archivos en el mismo cambio.

export type Usuario = {
  id: string;
  email: string;
  rol: string;
  fecha_registro: string;
};

export type Empresa = {
  id: string;
  id_usuario: string;
  nombre: string;
  nit: string;
  municipio: string;
  tipo_actor: TipoActor;
  medio_contacto?: string;
};

export type Subproducto = {
  id: string;
  id_empresa: string;
  nombre: string;
  descripcion?: string;
  id_familia: string;
  volumen_disponible: number;
  unidad_volumen: UnidadVolumen;
  municipio: string;
  estado_publicacion: "borrador" | "publicado";
  disponible: boolean;
};
