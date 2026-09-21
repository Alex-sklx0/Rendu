import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { Stepper } from "@/components/ui/Stepper";
import { PhotoDropzone } from "@/components/forms/PhotoDropzone";
import { FamilySelect } from "@/components/forms/FamilySelect";
import { MunicipioSelect } from "@/components/forms/MunicipioSelect";
import { Select } from "@/components/ui/Select";
import { subproductoSchema, type SubproductoFormValues } from "@/lib/validators";
import { UNIDADES_VOLUMEN } from "@/lib/constants";
import type { UnidadVolumen } from "@/lib/constants";
import { registrarSubproducto } from "@/api/client";

// TODO(api-contract): id_empresa debería venir de la empresa activa en sesión.
const DEMO_EMPRESA_ID = "demo-empresa";

const STEPS = [
  { label: "Información" },
  { label: "Ubicación" },
  { label: "Revisión" },
];

export default function RegisterSubproductPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubproductoFormValues>({
    resolver: zodResolver(subproductoSchema),
  });

  async function onSubmit(values: SubproductoFormValues) {
    setSubmitError(null);
    setSuccess(false);
    try {
      await registrarSubproducto({
        id_empresa: DEMO_EMPRESA_ID,
        nombre: values.nombre,
        descripcion: values.descripcion || undefined,
        id_familia: values.id_familia,
        volumen_disponible: values.volumen_disponible,
        unidad_volumen: values.unidad_volumen as UnidadVolumen,
        municipio: values.municipio,
      });
      setSuccess(true);
      reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo registrar el subproducto."
      );
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* ─── Page Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Recycle icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F5233" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
              <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
              <path d="m14 16-3 3 3 3" />
              <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
              <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 12.013 3a1.784 1.784 0 0 1 1.575.887l3.974 6.835" />
              <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
            </svg>
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-forest-600">
              Nuevo registro
            </span>
          </div>
          <h1 className="text-2xl font-bold text-ink-900">
            Registra un subproducto
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Publica materiales disponibles para que vuelvan al ciclo productivo.
          </p>
        </div>
        <span className="badge mt-1">Borrador</span>
      </div>

      {/* ─── Stepper ───────────────────────────────────────────── */}
      <div className="card mb-8 !py-6">
        <Stepper steps={STEPS} currentStep={currentStep} />
      </div>

      {/* ─── Banners ───────────────────────────────────────────── */}
      {submitError && (
        <div className="mb-6">
          <Banner variant="error">{submitError}</Banner>
        </div>
      )}
      {success && (
        <div className="mb-6">
          <Banner variant="success">Subproducto registrado correctamente como borrador.</Banner>
        </div>
      )}

      {/* ─── Form ──────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="card mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
            {/* ── Left Column: Photos ──────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink-900">Fotografías</h2>
                <span className="text-xs text-ink-300">Hasta 3 archivos</span>
              </div>
              <PhotoDropzone maxFiles={3} maxSizeMB={5} />
            </div>

            {/* ── Right Column: Fields ─────────────────────────── */}
            <div className="space-y-5">
              <FormField
                label="Nombre del subproducto"
                htmlFor="nombre"
                error={errors.nombre?.message}
                required
              >
                <Input
                  id="nombre"
                  placeholder="Ej. Retal de polipropileno"
                  hasError={!!errors.nombre}
                  {...register("nombre")}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Familia de material"
                  htmlFor="id_familia"
                  error={errors.id_familia?.message}
                  required
                >
                  <FamilySelect
                    registration={register("id_familia")}
                    hasError={!!errors.id_familia}
                  />
                </FormField>

                <FormField
                  label="Municipio"
                  htmlFor="municipio"
                  error={errors.municipio?.message}
                  required
                >
                  <MunicipioSelect
                    registration={register("municipio")}
                    hasError={!!errors.municipio}
                  />
                </FormField>
              </div>

              <FormField
                label="Volumen disponible"
                htmlFor="volumen_disponible"
                error={errors.volumen_disponible?.message ?? errors.unidad_volumen?.message}
                required
              >
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <Input
                    id="volumen_disponible"
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    placeholder="0.00"
                    hasError={!!errors.volumen_disponible}
                    {...register("volumen_disponible")}
                  />
                  <Select
                    id="unidad_volumen"
                    hasError={!!errors.unidad_volumen}
                    defaultValue=""
                    className="w-28"
                    {...register("unidad_volumen")}
                  >
                    <option value="" disabled>
                      kg
                    </option>
                    {UNIDADES_VOLUMEN.map((unidad) => (
                      <option key={unidad.value} value={unidad.value}>
                        {unidad.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </FormField>

              <FormField
                label="Descripción"
                htmlFor="descripcion"
                error={errors.descripcion?.message}
                optional
              >
                <Textarea
                  id="descripcion"
                  placeholder="Describe el estado, composición o condiciones de entrega..."
                  hasError={!!errors.descripcion}
                  {...register("descripcion")}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* ─── Location Info Banner ────────────────────────────── */}
        <div className="info-banner mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          La ubicación exacta solo será visible para contactos autorizados.
        </div>

        {/* ─── Footer Actions ──────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            iconLeft={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            }
          >
            Volver
          </Button>

          <div className="flex gap-3">
            <Button type="button" variant="secondary">
              Guardar borrador
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              iconRight={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              }
            >
              {isSubmitting ? "Guardando…" : "Continuar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
