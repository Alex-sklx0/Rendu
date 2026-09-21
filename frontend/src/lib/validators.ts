import { z } from "zod";

// HU-01 — Registrar usuario (persona). Criterio: campos requeridos + formato de email.
export const personaSchema = z
  .object({
    nombre_completo: z
      .string()
      .min(1, "El nombre es obligatorio."),
    email: z
      .string()
      .min(1, "El correo es obligatorio.")
      .email("Ingresa un correo electrónico válido."),
    password: z
      .string()
      .min(1, "La contraseña es obligatoria.")
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    aceptar_terminos: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos.",
    }),
  });

export type PersonaFormValues = z.infer<typeof personaSchema>;

// HU-01 — Registrar usuario (empresa). Criterio: datos de empresa + email + password.
export const empresaRegistroSchema = z
  .object({
    razon_social: z
      .string()
      .min(1, "La razón social es obligatoria."),
    nit: z
      .string()
      .min(1, "El NIT es obligatorio.")
      .regex(/^[0-9]{3,3}\.[0-9]{3,3}\.[0-9]{3,3}-[0-9]$|^[0-9]{5,15}-?[0-9]?$/, "Ingresa un NIT válido."),
    email: z
      .string()
      .min(1, "El correo corporativo es obligatorio.")
      .email("Ingresa un correo electrónico válido."),
    password: z
      .string()
      .min(1, "La contraseña es obligatoria.")
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    aceptar_terminos: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos.",
    }),
  });

export type EmpresaRegistroFormValues = z.infer<typeof empresaRegistroSchema>;

// Backward-compatible schemas for api-contract alignment
// HU-01 — Registrar usuario (legacy shape)
export const usuarioSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo es obligatorio.")
      .email("Ingresa un correo electrónico válido."),
    password: z
      .string()
      .min(1, "La contraseña es obligatoria.")
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmarPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmarPassword"],
  });

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;

// HU-02 — Registrar empresa.
export const empresaSchema = z.object({
  nombre: z.string().min(1, "El nombre de la empresa es obligatorio."),
  nit: z
    .string()
    .min(1, "El NIT es obligatorio.")
    .regex(/^[0-9]{5,15}-?[0-9]?$/, "Ingresa un NIT válido (solo números, guion opcional)."),
  municipio: z.string().min(1, "Selecciona un municipio."),
  tipo_actor: z.string().min(1, "Selecciona el tipo de actor."),
  medio_contacto: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val) || /^\+?[0-9\s-]{7,15}$/.test(val),
      "Ingresa un link (https://...) o un número de contacto válido."
    ),
});

export type EmpresaFormValues = z.infer<typeof empresaSchema>;

// HU-03/04/05/06 — Registrar subproducto (incluye familia, volumen y municipio).
export const subproductoSchema = z.object({
  nombre: z.string().min(1, "El nombre del subproducto es obligatorio."),
  descripcion: z.string().optional(),
  id_familia: z.string().min(1, "Selecciona una familia de material."),
  volumen_disponible: z.coerce
    .number({ invalid_type_error: "Ingresa un valor numérico." })
    .positive("El volumen debe ser mayor a cero."),
  unidad_volumen: z.string().min(1, "Selecciona una unidad."),
  municipio: z.string().min(1, "Selecciona un municipio."),
});

export type SubproductoFormValues = z.infer<typeof subproductoSchema>;
