import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Banner } from "@/components/ui/Banner";
import { PhotoDropzone } from "@/components/forms/PhotoDropzone";
import { FamilySelect } from "@/components/forms/FamilySelect";
import { MunicipioSelect } from "@/components/forms/MunicipioSelect";
import { Select } from "@/components/ui/Select";
import { subproductoSchema, type SubproductoFormValues } from "@/lib/validators";
import { UNIDADES_VOLUMEN } from "@/lib/constants";
import type { UnidadVolumen } from "@/lib/constants";
import { registrarSubproducto } from "@/api/client";


const FRECUENCIAS = [
  { value: "Una vez", label: "Una vez (lote único)" },
  { value: "Semanal", label: "Semanal (generación constante)" },
  { value: "Quincenal", label: "Quincenal" },
  { value: "Mensual", label: "Mensual" },
];

export default function PostSubproductPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [frecuencia, setFrecuencia] = useState("Una vez");
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubproductoFormValues>({
    resolver: zodResolver(subproductoSchema),
    defaultValues: {
      unidad_volumen: "kg",
    },
  });

  async function onSubmit(values: SubproductoFormValues) {
    setSubmitError(null);
    setSuccess(false);
    try {
      let companyId: string | null = null;
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.id_empresa) companyId = String(parsed.id_empresa);
        } catch {
          // ignorar error
        }
      }

      if (!companyId) {
        setSubmitError("No se encontró tu empresa registrada. Por favor cierra sesión, inicia de nuevo e intenta otra vez.");
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
        frecuencia: frecuencia,
        image_url: imageUrl,
      });
      setSuccess(true);
      reset();
      setTimeout(() => {
        navigate("/catalogo");
      }, 1500);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo publicar el material."
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* ── Back button ───────────────────────────────────────────── */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate("/catalogo")}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-forest-700 transition-colors hover:text-forest-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver al catálogo
        </button>
      </div>

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-forest-900 sm:text-4xl">
          Publicar material
        </h1>
        <p className="mt-1.5 text-base text-ink-500">
          Describe el subproducto para encontrar empresas interesadas.
        </p>
      </div>

      {/* ── Banners ───────────────────────────────────────────────── */}
      {submitError && (
        <div className="mb-6">
          <Banner variant="error">{submitError}</Banner>
        </div>
      )}
      {success && (
        <div className="mb-6">
          <Banner variant="success">
            ¡Material publicado con éxito! Redirigiendo al catálogo...
          </Banner>
        </div>
      )}

      {/* ── Form Card ─────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-6">
            {/* Grid row 1: Tipo de material y Cantidad */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                label="Tipo de material"
                htmlFor="nombre"
                error={errors.nombre?.message}
                required
              >
                <Input
                  id="nombre"
                  placeholder="Ej. Recortes de algodón"
                  hasError={!!errors.nombre}
                  {...register("nombre")}
                />
              </FormField>

              <FormField
                label="Cantidad disponible"
                htmlFor="volumen_disponible"
                error={errors.volumen_disponible?.message ?? errors.unidad_volumen?.message}
                required
              >
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    id="volumen_disponible"
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    placeholder="Ej. 250"
                    hasError={!!errors.volumen_disponible}
                    {...register("volumen_disponible")}
                  />
                  <Select
                    id="unidad_volumen"
                    hasError={!!errors.unidad_volumen}
                    defaultValue="kg"
                    className="w-24"
                    {...register("unidad_volumen")}
                  >
                    {UNIDADES_VOLUMEN.map((unidad) => (
                      <option key={unidad.value} value={unidad.value}>
                        {unidad.value}
                      </option>
                    ))}
                  </Select>
                </div>
              </FormField>
            </div>

            {/* Grid row 2: Frecuencia y Ubicación */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="frecuencia">
                  Frecuencia
                </label>
                <select
                  id="frecuencia"
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(e.target.value)}
                  className="field-input"
                >
                  {FRECUENCIAS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <FormField
                label="Ubicación"
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

            {/* Grid row 3: Familia de clasificación */}
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

            {/* Grid row 4: Descripción */}
            <FormField
              label="Descripción"
              htmlFor="descripcion"
              error={errors.descripcion?.message}
              optional
            >
              <Textarea
                id="descripcion"
                rows={3}
                placeholder="Estado del material, condiciones de entrega, composición..."
                hasError={!!errors.descripcion}
                {...register("descripcion")}
              />
            </FormField>

            {/* Grid row 5: Foto del material */}
            <div className="grid gap-4 sm:grid-cols-[1fr_192px] sm:items-end">
              <div>
                <label className="field-label">Foto del material</label>
                <PhotoDropzone maxFiles={3} maxSizeMB={5} onPrimaryImageChange={setImageUrl} showPreviews={false} />
              </div>
              <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-[#cce9df] sm:w-48">
                {imageUrl ? (
                  <img src={imageUrl} alt="Vista previa del material" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-center text-xs font-semibold text-[#00805b]">Vista previa</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Form Actions ────────────────────────────────────────── */}
          <div className="mt-8 flex items-center justify-start gap-3 border-t border-surface-100 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-[#23ce6b] px-7 py-3 text-base font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Publicando…" : "Publicar"}
            </button>
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center rounded-xl border border-surface-200 bg-surface-100 px-6 py-3 text-base font-bold text-forest-800 transition-colors hover:bg-surface-200"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
