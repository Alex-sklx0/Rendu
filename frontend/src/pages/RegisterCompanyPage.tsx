import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { MunicipioSelect } from "@/components/forms/MunicipioSelect";
import { empresaSchema, type EmpresaFormValues } from "@/lib/validators";
import { TIPOS_ACTOR, type TipoActor } from "@/lib/constants";
import { registrarEmpresa } from "@/api/client";

// TODO(api-contract): id_usuario debería venir de la sesión autenticada (HU-01) una vez
// exista auth real en el backend de Carolina. Por ahora se usa un id de demo.
const DEMO_USER_ID = "demo-user";

export default function RegisterCompanyPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
  });

  async function onSubmit(values: EmpresaFormValues) {
    setSubmitError(null);
    try {
      await registrarEmpresa({
        id_usuario: DEMO_USER_ID,
        nombre: values.nombre,
        nit: values.nit,
        municipio: values.municipio,
        tipo_actor: values.tipo_actor as TipoActor,
        medio_contacto: values.medio_contacto || undefined,
      });
      navigate("/subproductos/nuevo");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo registrar la empresa.");
    }
  }

  return (
    <div className="card">
      <h1 className="text-xl font-semibold text-ink-900 mb-1">Registra tu empresa</h1>
      <p className="text-sm text-ink-500 mb-6">
        Esta información queda asociada a tu cuenta y es visible para otras organizaciones.
      </p>

      {submitError && (
        <div className="mb-4">
          <Banner variant="error">{submitError}</Banner>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Nombre de la empresa" htmlFor="nombre" error={errors.nombre?.message} required>
          <Input
            id="nombre"
            placeholder="Ej. Papelsa S.A."
            hasError={!!errors.nombre}
            {...register("nombre")}
          />
        </FormField>

        <FormField label="NIT" htmlFor="nit" error={errors.nit?.message} required>
          <Input
            id="nit"
            placeholder="Ej. 890900000-1"
            hasError={!!errors.nit}
            {...register("nit")}
          />
        </FormField>

        <FormField label="Tipo de actor" htmlFor="tipo_actor" error={errors.tipo_actor?.message} required>
          <Select id="tipo_actor" hasError={!!errors.tipo_actor} defaultValue="" {...register("tipo_actor")}>
            <option value="" disabled>
              Selecciona el tipo de actor
            </option>
            {TIPOS_ACTOR.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Municipio" htmlFor="municipio" error={errors.municipio?.message} required>
          <MunicipioSelect registration={register("municipio")} hasError={!!errors.municipio} />
        </FormField>

        <FormField
          label="Medio de contacto"
          htmlFor="medio_contacto"
          error={errors.medio_contacto?.message}
          hint="Link de WhatsApp o número telefónico. Se usará para que otras empresas te contacten (HU-19)."
        >
          <Input
            id="medio_contacto"
            placeholder="https://wa.me/57300..."
            hasError={!!errors.medio_contacto}
            {...register("medio_contacto")}
          />
        </FormField>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Guardando…" : "Guardar empresa"}
        </Button>
      </form>
    </div>
  );
}
