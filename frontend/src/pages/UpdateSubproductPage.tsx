// Pagina para editar un subproducto

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { PhotoDropzone } from "@/components/forms/PhotoDropzone";
import { Select } from "@/components/ui/Select";
import { actualizarSubproducto, cambiarEstadoPublicacion, getSubproductoDetalle } from "@/api/client";
import { MUNICIPIOS_VALLE_ABURRA, UNIDADES_VOLUMEN, type UnidadVolumen } from "@/lib/constants";
import type { SubproductoDetalle } from "@/types";

const FRECUENCIAS = [
  { value: "Una vez", label: "Una vez (lote único)" },
  { value: "Semanal", label: "Semanal (generación constante)" },
  { value: "Quincenal", label: "Quincenal" },
  { value: "Mensual", label: "Mensual" },
];

export default function UpdateSubproductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<SubproductoDetalle | null>(null);
  const [imageUrl, setImageUrl] = useState<string>();
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    volumen_disponible: "",
    unidad_volumen: "kg" as UnidadVolumen,
    municipio: "Medellín",
    frecuencia: "Una vez",
    disponible: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitMode, setSubmitMode] = useState<"actualizar" | "borrador">("actualizar");

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/login", { replace: true });
      return;
    }
    if (!id) return;
    getSubproductoDetalle(id).then((data) => {
      setItem(data);
      setImageUrl(data.image_url);
      setForm({
        nombre: data.nombre,
        descripcion: data.descripcion,
        volumen_disponible: String(data.volumen_disponible),
        unidad_volumen: data.unidad_volumen as UnidadVolumen,
        municipio: data.municipio,
        frecuencia: data.frecuencia ?? "Una vez",
        disponible: data.disponible !== false,
      });
    }).catch(() => setMessage("No encontramos este subproducto."))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  function updateField<K extends keyof typeof form>(field: K, value: typeof form[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  // Guardar los cambios del material
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const selectedMode = submitter?.dataset.mode ?? "principal";
    setSubmitMode(selectedMode === "borrador" ? "borrador" : "actualizar");
    setSaving(true);
    setMessage(null);
    try {
      const storedUser = localStorage.getItem("user");
      const companyId = storedUser ? JSON.parse(storedUser).id_empresa : null;
      if (!companyId) throw new Error("No se encontró la empresa propietaria.");
      if (!item) throw new Error("No se encontró el subproducto.");
      const wasPublished = item.id_estado_publicacion === 2;
      await actualizarSubproducto(id, companyId, {
        ...form,
        volumen_disponible: Number(form.volumen_disponible),
        image_url: imageUrl,
        disponible: form.disponible,
      });
      const shouldPublish = selectedMode === "borrador" ? false : true;
      if (shouldPublish !== wasPublished) {
        await cambiarEstadoPublicacion(id, companyId, shouldPublish);
      }
      setMessage("Cambios guardados correctamente.");
      setTimeout(() => {
        if (shouldPublish) {
          navigate(`/catalog/${id}`);
        } else {
          navigate("/profile");
        }
      }, 700);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo actualizar el material.");
    } finally {
      setSaving(false);
    }
  }


  if (loading) return <div className="flex min-h-[500px] items-center justify-center text-sm text-ink-500">Cargando publicación...</div>;
  if (!item) return <div className="mx-auto max-w-xl py-16 text-center text-sm text-red-700">{message}</div>;

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="mb-4">
        <motion.div
          whileHover={{ x: -12 }}
          whileTap={{ x: -3 }}
          transition={{ type: "spring", stiffness: 340, damping: 26, mass: 0.7 }}
        >
          <Link to="/profile" className="relative -left-3 inline-flex items-center gap-2 px-3 py-2 text-lg font-bold text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600/40">
          ← Volver al perfil
          </Link>
        </motion.div>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-forest-900 sm:text-4xl">Actualizar material</h1>
        <p className="mt-1.5 text-base text-ink-500">Actualiza el subproducto para encontrar empresas interesadas.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-3xl border border-surface-300 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-6">
        {/* Datos basicos del material */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="field-label">
            Tipo de material
            <input
              className="field-input mt-1 rounded-2xl"
              value={form.nombre}
              placeholder="Ej. Recortes de algodón"
              onChange={(event) => updateField("nombre", event.target.value)}
              required
            />
          </label>
          <label className="field-label">
            Cantidad disponible
            <div className="mt-1 grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_auto_auto]">
              <input
                className="field-input rounded-2xl"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.volumen_disponible}
                placeholder="Ej. 250"
                onChange={(event) => {
                  const volumen = event.target.value;
                  updateField("volumen_disponible", volumen);
                  updateField("disponible", Number(volumen) > 0);
                }}
                required
              />
              <Select className="w-24" value={form.unidad_volumen} onChange={(event) => updateField("unidad_volumen", event.target.value as UnidadVolumen)}>
                {UNIDADES_VOLUMEN.map((unidad) => <option key={unidad.value} value={unidad.value}>{unidad.value}</option>)}
              </Select>
              <button
                type="button"
                onClick={() => {
                  updateField("volumen_disponible", "0");
                  updateField("disponible", false);
                }}
                className="col-span-2 inline-flex items-center justify-center rounded-2xl bg-amber-200 text-amber-800 px-4 py-3 text-sm font-bold shadow-sm transition-colors hover:bg-amber-800 hover:text-white sm:col-span-1"
              >
                {form.disponible ? "Marcar sin stock" : "Sin stock"}
              </button>
            </div>
          </label>
          <label className="field-label">
            Frecuencia
            <Select value={form.frecuencia} onChange={(event) => updateField("frecuencia", event.target.value)}>
              {FRECUENCIAS.map((frecuencia) => <option key={frecuencia.value} value={frecuencia.value}>{frecuencia.label}</option>)}
            </Select>
          </label>
          <label className="field-label">Ubicación<Select value={form.municipio} onChange={(event) => updateField("municipio", event.target.value)}>{MUNICIPIOS_VALLE_ABURRA.map((municipio) => <option key={municipio}>{municipio}</option>)}</Select></label>
          <label className="field-label sm:col-span-2">Descripción<textarea className="field-input mt-1 min-h-[120px] resize-y rounded-2xl" value={form.descripcion} placeholder="Estado del material, condiciones de entrega, composición..." onChange={(event) => updateField("descripcion", event.target.value)} /></label>
        </div>

        <div className="mt-6 grid gap-8 sm:grid-cols-[1fr_240px] sm:items-end">
          {/* Foto del material */}
          <div>
            <span className="field-label">Foto del material</span>
            <PhotoDropzone
              maxFiles={3}
              maxSizeMB={5}
              onPrimaryImageChange={setImageUrl}
              showPreviews={false}
            />
          </div>
          <div className="flex h-60 w-60 items-center justify-center overflow-hidden rounded-2xl bg-[#cce9df] sm:w-60" role="img" aria-label="Vista previa del material">{imageUrl ? <img src={imageUrl} alt="Vista previa del material" className="h-full w-full object-cover" /> : <span className="text-center text-xs font-semibold text-[#00805b]">Vista previa</span>}</div>
        </div>

        {message && <p className={`mt-4 text-sm font-semibold ${message.includes("correctamente") ? "text-[#00805b]" : "text-red-600"}`}>{message}</p>}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-surface-100 pt-6">
          <div className="flex gap-2">
            <button type="submit" data-mode="principal" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#23ce6b] px-7 py-3 text-base font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Guardando..." : item.id_estado_publicacion === 2 ? "Actualizar" : "Publicar"}</button>
            <button
              type="submit"
              data-mode="borrador"
              onClick={() => setSubmitMode("borrador")}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-surface-300 bg-ink-700 px-6 py-3 text-base font-bold text-white shadow-sm transition-all hover:bg-surface-200 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && submitMode === "borrador" ? "Guardando…" : "Guardar como borrador"}
            </button>
            <Link to="/profile" className="inline-flex items-center justify-center rounded-2xl border border-surface-300 bg-white px-6 py-3 text-base font-bold text-ink-600 transition-colors hover:border-signal-error hover:bg-signal-error hover:text-white">Cancelar</Link>
          </div>
        </div>
        </div>
      </form>
    </div>
  );
}
