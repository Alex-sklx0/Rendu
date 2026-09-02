import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { usuarioSchema, type UsuarioFormValues } from "@/lib/validators";
import { registrarUsuario } from "@/api/client";

export default function RegisterUserPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
  });

  async function onSubmit(values: UsuarioFormValues) {
    setSubmitError(null);
    try {
      await registrarUsuario({ email: values.email, password: values.password });
      navigate("/registro/empresa");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    }
  }

  return (
    <div className="card">
      <h1 className="text-xl font-semibold text-ink-900 mb-1">Crea tu cuenta en RENDU</h1>
      <p className="text-sm text-ink-500 mb-6">
        Con esta cuenta podrás registrar tu empresa y publicar subproductos disponibles.
      </p>

      {submitError && (
        <div className="mb-4">
          <Banner variant="error">{submitError}</Banner>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Correo electrónico" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nombre@empresa.com"
            hasError={!!errors.email}
            {...register("email")}
          />
        </FormField>

        <FormField label="Contraseña" htmlFor="password" error={errors.password?.message} required>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            hasError={!!errors.password}
            {...register("password")}
          />
        </FormField>

        <FormField
          label="Confirmar contraseña"
          htmlFor="confirmarPassword"
          error={errors.confirmarPassword?.message}
          required
        >
          <Input
            id="confirmarPassword"
            type="password"
            autoComplete="new-password"
            hasError={!!errors.confirmarPassword}
            {...register("confirmarPassword")}
          />
        </FormField>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}
