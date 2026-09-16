import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { actualizarSubproducto, eliminarSubproducto, getSubproductoDetalle } from "@/api/client";
import { MUNICIPIOS_VALLE_ABURRA, UNIDADES_VOLUMEN, type UnidadVolumen } from "@/lib/constants";
import type { SubproductoDetalle } from "@/types";

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    setSaving(true);
    setMessage(null);
    try {
      await actualizarSubproducto(id, {
        ...form,
        volumen_disponible: Number(form.volumen_disponible),
        image_url: imageUrl,
        disponible: form.disponible,
      });
      setMessage("Cambios guardados correctamente.");
      setTimeout(() => navigate(`/catalogo/${id}`), 700);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo actualizar el material.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar este material?`);
    if (!confirm) return;
    try {
      await eliminarSubproducto(id);
      navigate("/perfil");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al eliminar el material.");
    }
  }

  if (loading) return <div className="flex min-h-[500px] items-center justify-center text-sm text-ink-500">Cargando publicación...</div>;
  if (!item) return <div className="mx-auto max-w-xl py-16 text-center text-sm text-red-700">{message}</div>;

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <Link to="/perfil" className="text-xs font-bold text-[#16b866]">← Volver al inicio</Link>
      <div className="mt-3">
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Actualizar material</h1>
        <p className="text-sm text-ink-500">Actualiza la descripción o el subproducto para encontrar empresas interesadas.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-surface-200 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field-label">Tipo de material<input className="field-input mt-1" value={form.nombre} onChange={(event) => updateField("nombre", event.target.value)} required /></label>
          <label className="field-label">Cantidad disponible<div className="mt-1 grid grid-cols-[1fr_110px] gap-2"><input className="field-input" type="number" min="0" step="any" value={form.volumen_disponible} onChange={(event) => updateField("volumen_disponible", event.target.value)} required /><select className="field-input" value={form.unidad_volumen} onChange={(event) => updateField("unidad_volumen", event.target.value as UnidadVolumen)}>{UNIDADES_VOLUMEN.map((unidad) => <option key={unidad.value} value={unidad.value}>{unidad.value}</option>)}</select></div></label>
          <label className="field-label">Frecuencia<select className="field-input mt-1" value={form.frecuencia} onChange={(event) => updateField("frecuencia", event.target.value)}><option>Una vez</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option></select></label>
          <label className="field-label">Ubicación<select className="field-input mt-1" value={form.municipio} onChange={(event) => updateField("municipio", event.target.value)}>{MUNICIPIOS_VALLE_ABURRA.map((municipio) => <option key={municipio}>{municipio}</option>)}</select></label>
          <label className="field-label sm:col-span-2">Descripción<textarea className="field-input mt-1 min-h-28 resize-y" value={form.descripcion} onChange={(event) => updateField("descripcion", event.target.value)} /></label>

          {/* Toggle de Disponibilidad */}
          <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-surface-200 bg-surface-50 p-4">
            <div>
              <span className="block text-sm font-bold text-ink-900">
                Disponibilidad del material
              </span>
              <span className="text-xs text-ink-500">
                {form.disponible
                  ? "El subproducto está disponible para retiro y solicitudes en el catálogo."
                  : "El subproducto está marcado como sin stock (pausado) en el catálogo."}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.disponible}
              onClick={() => updateField("disponible", !form.disponible)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.disponible ? "bg-[#23ce6b]" : "bg-surface-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  form.disponible ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1"><span className="field-label">Foto del material</span><label className="flex h-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-surface-200 text-xs text-ink-500 hover:border-[#23ce6b]"><span>▣ Arrastra una imagen aquí o selecciona un archivo</span><input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setImageUrl(reader.result as string); reader.readAsDataURL(file); }} /></label></div>
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#cce9df]" role="img" aria-label="Vista previa del material">{imageUrl ? <img src={imageUrl} alt="Vista previa del material" className="h-full w-full object-cover" /> : <span className="text-center text-xs font-semibold text-[#00805b]">Vista previa</span>}</div>
        </div>

        {message && <p className={`mt-4 text-sm font-semibold ${message.includes("correctamente") ? "text-[#00805b]" : "text-red-600"}`}>{message}</p>}
        <div className="mt-5 flex items-center justify-between border-t border-surface-100 pt-4">
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded-md bg-[#23ce6b] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1fb85f] disabled:opacity-60">{saving ? "Guardando..." : "Actualizar"}</button>
            <Link to={`/catalogo/${id}`} className="rounded-md bg-[#e9f0ed] px-4 py-2 text-xs font-bold text-[#23ce6b] hover:bg-[#d8e6e1] transition-colors">Cancelar</Link>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Eliminar material</span>
          </button>
        </div>
      </form>
    </div>
  );
}
