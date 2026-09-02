import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { FamilySelect } from "@/components/forms/FamilySelect";
import { MunicipioSelect } from "@/components/forms/MunicipioSelect";
import { VolumeField } from "@/components/forms/VolumeField";
import { subproductoSchema, type SubproductoFormValues } from "@/lib/validators";
import type { UnidadVolumen } from "@/lib/constants";
import { registrarSubproducto } from "@/api/client";

// TODO(api-contract): id_empresa debería venir de la empresa activa en sesión.
const DEMO_EMPRESA_ID = "demo-empresa";

export default function RegisterSubproductPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    <div className="card">
      <h1 className="text-xl font-semibold text-ink-900 mb-1">Registrar subproducto</h1>
      <p className="text-sm text-ink-500 mb-6">
        Este material queda guardado como borrador. Podrás publicarlo desde tu panel más
        adelante.
      </p>

      {submitError && (
        <div className="mb-4">
          <Banner variant="error">{submitError}</Banner>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Banner variant="success">Subproducto registrado correctamente.</Banner>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Nombre del subproducto" htmlFor="nombre" error={errors.nombre?.message} required>
          <Input
            id="nombre"
            placeholder="Ej. Recorte de cartón corrugado"
            hasError={!!errors.nombre}
            {...register("nombre")}
          />
        </FormField>

        <FormField
          label="Descripción"
          htmlFor="descripcion"
          error={errors.descripcion?.message}
          hint="Opcional. Detalles como estado, contaminación o pureza del material."
        >
          <Input id="descripcion" hasError={!!errors.descripcion} {...register("descripcion")} />
        </FormField>

        <FormField
          label="Familia de material"
          htmlFor="id_familia"
          error={errors.id_familia?.message}
          required
        >
          <FamilySelect registration={register("id_familia")} hasError={!!errors.id_familia} />
        </FormField>

        <FormField
          label="Volumen disponible"
          htmlFor="volumen_disponible"
          error={errors.volumen_disponible?.message ?? errors.unidad_volumen?.message}
          required
        >
          <VolumeField
            amountRegistration={register("volumen_disponible")}
            unitRegistration={register("unidad_volumen")}
            amountHasError={!!errors.volumen_disponible}
            unitHasError={!!errors.unidad_volumen}
          />
        </FormField>

        <FormField label="Municipio" htmlFor="municipio" error={errors.municipio?.message} required>
          <MunicipioSelect registration={register("municipio")} hasError={!!errors.municipio} />
        </FormField>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Guardando…" : "Guardar subproducto"}
        </Button>
      </form>
    </div>
  );
}
