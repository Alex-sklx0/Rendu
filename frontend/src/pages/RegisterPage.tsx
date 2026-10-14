// Pagina para crear una cuenta de persona o empresa

import { useState } from "react";
import inlineSvg19 from "@/img/check-green.svg";
import inlineSvg20 from "@/img/arrow.svg";
import inlineSvg21 from "@/img/person.svg";
import inlineSvg22 from "@/img/company.svg";
import inlineSvg23 from "@/img/list.svg";
import inlineSvg24 from "@/img/arrow.svg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import {
  personaSchema,
  empresaRegistroSchema,
  type PersonaFormValues,
  type EmpresaRegistroFormValues,
} from "@/lib/validators";
import { registrarUsuario } from "@/api/client";
import clsx from "@/lib/clsx";

type TabType = "persona" | "empresa";

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<TabType>("persona");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Formulario de persona
  const personaForm = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: { aceptar_terminos: false },
  });

  // Formulario de empresa
  const empresaForm = useForm<EmpresaRegistroFormValues>({
    resolver: zodResolver(empresaRegistroSchema),
    defaultValues: { aceptar_terminos: false },
  });

  async function onSubmitPersona(values: PersonaFormValues) {
    setSubmitError(null);
    try {
      await registrarUsuario({ email: values.email, password: values.password });
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    }
  }

  async function onSubmitEmpresa(values: EmpresaRegistroFormValues) {
    setSubmitError(null);
    try {
      await registrarUsuario({ email: values.email, password: values.password });
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    }
  }

  if (submitSuccess) {
    return (
      <div className="register-card text-center py-12">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-forest-700/10 flex items-center justify-center">
          <img src={inlineSvg19} width={"28"} height={"28"} alt="" />
        </div>
        <h2 className="text-xl font-bold text-ink-900 mb-2">¡Cuenta creada!</h2>
        <p className="text-ink-500 text-sm mb-6">Tu cuenta ha sido registrada exitosamente.</p>
        <Link to="/subproducts/new" className="btn-primary">
          Publicar subproducto
          <img src={inlineSvg20} width={"16"} height={"16"} alt="" />
        </Link>
      </div>
    );
  }

  return (
    <div className="register-card">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-forest-600 mb-2">
          Únete a la circularidad
        </p>
        <h1 className="text-3xl font-bold text-ink-900 mb-2">
          Crea tu cuenta
        </h1>
        <p className="text-sm text-ink-500 leading-relaxed">
          Conecta materiales disponibles con nuevas oportunidades
          <br />
          de aprovechamiento.
        </p>
      </div>

      {/* Pestañas para elegir persona o empresa */}
      <div className="tab-group mb-8">
        <button
          type="button"
          className={clsx("tab-button", activeTab === "persona" && "tab-button-active")}
          onClick={() => { setActiveTab("persona"); setSubmitError(null); }}
        >
          {/* Icono de persona */}
          <img src={inlineSvg21} width={"16"} height={"16"} alt="" />
          Persona
        </button>
        <button
          type="button"
          className={clsx("tab-button", activeTab === "empresa" && "tab-button-active")}
          onClick={() => { setActiveTab("empresa"); setSubmitError(null); }}
        >
          {/* Icono de edificio */}
          <img src={inlineSvg22} width={"16"} height={"16"} alt="" />
          Empresa
        </button>
      </div>

      {submitError && (
        <div className="mb-6">
          <Banner variant="error">{submitError}</Banner>
        </div>
      )}

      {/* Formulario de persona */}
      {activeTab === "persona" && (
        <form
          className="space-y-5"
          onSubmit={personaForm.handleSubmit(onSubmitPersona)}
          noValidate
        >
          <FormField
            label="Nombre completo"
            htmlFor="nombre_completo"
            error={personaForm.formState.errors.nombre_completo?.message}
            required
          >
            <Input
              id="nombre_completo"
              placeholder="Ej. Laura Gómez"
              autoComplete="name"
              hasError={!!personaForm.formState.errors.nombre_completo}
              {...personaForm.register("nombre_completo")}
            />
          </FormField>

          <FormField
            label="Correo electrónico"
            htmlFor="email"
            error={personaForm.formState.errors.email?.message}
            required
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nombre@empresa.com"
              hasError={!!personaForm.formState.errors.email}
              {...personaForm.register("email")}
            />
          </FormField>

          <FormField
            label="Contraseña"
            htmlFor="password"
            error={personaForm.formState.errors.password?.message}
            required
          >
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              hasError={!!personaForm.formState.errors.password}
              {...personaForm.register("password")}
            />
          </FormField>

          {/* Aceptar terminos y condiciones */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-surface-200 text-forest-700 focus:ring-forest-600 accent-forest-700"
              {...personaForm.register("aceptar_terminos")}
            />
            <span className="text-sm text-ink-700">
              Acepto los{" "}
              <span className="font-semibold text-forest-700 underline underline-offset-2 cursor-pointer hover:text-forest-800">
                términos
              </span>{" "}
              y la política de tratamiento de datos.
            </span>
          </label>
          {personaForm.formState.errors.aceptar_terminos && (
            <p className="field-error" role="alert">
              {personaForm.formState.errors.aceptar_terminos.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={personaForm.formState.isSubmitting}
            className="w-full !py-3.5 !text-base"
            iconRight={
              <img src={inlineSvg23} width={"18"} height={"18"} alt="" />
            }
          >
            {personaForm.formState.isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>
      )}

      {/* Formulario de empresa */}
      {activeTab === "empresa" && (
        <form
          className="space-y-5"
          onSubmit={empresaForm.handleSubmit(onSubmitEmpresa)}
          noValidate
        >
          <FormField
            label="Razón social"
            htmlFor="razon_social"
            error={empresaForm.formState.errors.razon_social?.message}
            required
          >
            <Input
              id="razon_social"
              placeholder="Ej. Materiales Andinos S.A.S."
              hasError={!!empresaForm.formState.errors.razon_social}
              {...empresaForm.register("razon_social")}
            />
          </FormField>

          <FormField
            label="NIT"
            htmlFor="nit"
            error={empresaForm.formState.errors.nit?.message}
            required
          >
            <Input
              id="nit"
              placeholder="900.123.456-7"
              hasError={!!empresaForm.formState.errors.nit}
              {...empresaForm.register("nit")}
            />
          </FormField>

          <FormField
            label="Correo corporativo"
            htmlFor="email_empresa"
            error={empresaForm.formState.errors.email?.message}
            required
          >
            <Input
              id="email_empresa"
              type="email"
              autoComplete="email"
              placeholder="nombre@empresa.com"
              hasError={!!empresaForm.formState.errors.email}
              {...empresaForm.register("email")}
            />
          </FormField>

          <FormField
            label="Contraseña"
            htmlFor="password_empresa"
            error={empresaForm.formState.errors.password?.message}
            required
          >
            <PasswordInput
              id="password_empresa"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              hasError={!!empresaForm.formState.errors.password}
              {...empresaForm.register("password")}
            />
          </FormField>

          {/* Aceptar terminos y condiciones */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-surface-200 text-forest-700 focus:ring-forest-600 accent-forest-700"
              {...empresaForm.register("aceptar_terminos")}
            />
            <span className="text-sm text-ink-700">
              Acepto los{" "}
              <span className="font-semibold text-forest-700 underline underline-offset-2 cursor-pointer hover:text-forest-800">
                términos
              </span>{" "}
              y la política de tratamiento de datos.
            </span>
          </label>
          {empresaForm.formState.errors.aceptar_terminos && (
            <p className="field-error" role="alert">
              {empresaForm.formState.errors.aceptar_terminos.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={empresaForm.formState.isSubmitting}
            className="w-full !py-3.5 !text-base"
            iconRight={
              <img src={inlineSvg24} width={"18"} height={"18"} alt="" />
            }
          >
            {empresaForm.formState.isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>
      )}

      {/* Enlace para ir al login */}
      <p className="text-center text-sm text-ink-500 mt-6">
        ¿Ya tienes una cuenta?{" "}
        <Link
          to="/"
          className="font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-800"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
