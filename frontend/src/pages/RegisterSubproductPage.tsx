// Pagina para registrar un nuevo subproducto

import { useState } from "react";
import inlineSvg25 from "@/img/recicle.svg";
import inlineSvg26 from "@/img/location.svg";
import inlineSvg27 from "@/img/alert.svg";
import inlineSvg28 from "@/img/arrow.svg";
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
      const storedUser = localStorage.getItem("user");
      const companyId = storedUser ? JSON.parse(storedUser).id_empresa : null;
      if (!companyId) {
        setSubmitError("No se encontró tu empresa registrada. Inicia sesión con una cuenta de empresa.");
        return;
      }
      await registrarSubproducto({
        id_empresa: companyId,
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
      {/* Encabezado de la pagina */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Icono de reciclaje */}
            <img src={inlineSvg25} width={"18"} height={"18"} alt="" />
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

      {/* Indicador de pasos */}
      <div className="card mb-8 !py-6">
        <Stepper steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Mensajes de error o exito */}
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

      {/* Formulario de registro */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="card mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
            {/* Columna izquierda con las fotos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink-900">Fotografías</h2>
                <span className="text-xs text-ink-300">Hasta 3 archivos</span>
              </div>
              <PhotoDropzone maxFiles={3} maxSizeMB={5} />
            </div>

            {/* Columna derecha con los campos del formulario */}
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

        {/* Aviso sobre la ubicacion */}
        <div className="info-banner mb-8">
          <img src={inlineSvg26} width={"16"} height={"16"} className={"flex-shrink-0"} alt="" />
          La ubicación exacta solo será visible para contactos autorizados.
        </div>

        {/* Botones de volver, guardar borrador y continuar */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            iconLeft={
              <img src={inlineSvg27} width={"16"} height={"16"} alt="" />
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
                <img src={inlineSvg28} width={"16"} height={"16"} alt="" />
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
