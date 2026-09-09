import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { actualizarSubproducto, getSubproductoDetalle } from "@/api/client";
import { MUNICIPIOS_VALLE_ABURRA, UNIDADES_VOLUMEN, type UnidadVolumen } from "@/lib/constants";
import type { SubproductoDetalle } from "@/types";

export default function UpdateSubproductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<SubproductoDetalle | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", volumen_disponible: "", unidad_volumen: "kg" as UnidadVolumen, municipio: "Medellín", frecuencia: "Una vez" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getSubproductoDetalle(id).then((data) => {
      setItem(data);
      setForm({ nombre: data.nombre, descripcion: data.descripcion, volumen_disponible: String(data.volumen_disponible), unidad_volumen: data.unidad_volumen as UnidadVolumen, municipio: data.municipio, frecuencia: data.frecuencia ?? "Una vez" });
    }).catch(() => setMessage("No encontramos este subproducto."))
      .finally(() => setLoading(false));
  }, [id]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    setSaving(true);
    setMessage(null);
    try {
      await actualizarSubproducto(id, { ...form, volumen_disponible: Number(form.volumen_disponible) });
      setMessage("Cambios guardados correctamente.");
      setTimeout(() => navigate(`/catalogo/${id}`), 700);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo actualizar el material.");
    } finally {
      setSaving(false);
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
          <label className="field-label">Cantidad disponible<div className="mt-1 grid grid-cols-[1fr_110px] gap-2"><input className="field-input" type="number" min="0" step="any" value={form.volumen_disponible} onChange={(event) => updateField("volumen_disponible", event.target.value)} required /><select className="field-input" value={form.unidad_volumen} onChange={(event) => updateField("unidad_volumen", event.target.value)}>{UNIDADES_VOLUMEN.map((unidad) => <option key={unidad.value} value={unidad.value}>{unidad.value}</option>)}</select></div></label>
          <label className="field-label">Frecuencia<select className="field-input mt-1" value={form.frecuencia} onChange={(event) => updateField("frecuencia", event.target.value)}><option>Una vez</option><option>Semanal</option><option>Quincenal</option><option>Mensual</option></select></label>
          <label className="field-label">Ubicación<select className="field-input mt-1" value={form.municipio} onChange={(event) => updateField("municipio", event.target.value)}>{MUNICIPIOS_VALLE_ABURRA.map((municipio) => <option key={municipio}>{municipio}</option>)}</select></label>
          <label className="field-label sm:col-span-2">Descripción<textarea className="field-input mt-1 min-h-28 resize-y" value={form.descripcion} onChange={(event) => updateField("descripcion", event.target.value)} /></label>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1"><span className="field-label">Foto del material</span><label className="flex h-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-surface-200 text-xs text-ink-500 hover:border-[#23ce6b]"><span>▣ Arrastra una imagen aquí o selecciona un archivo</span><input type="file" accept="image/*" className="sr-only" /></label></div>
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[#cce9df] text-4xl" role="img" aria-label="Vista previa del material">{item.emoji || "📦"}</div>
        </div>

        {message && <p className={`mt-4 text-sm font-semibold ${message.includes("correctamente") ? "text-[#00805b]" : "text-red-600"}`}>{message}</p>}
        <div className="mt-5 flex gap-2"><button type="submit" disabled={saving} className="rounded-md bg-[#23ce6b] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{saving ? "Actualizando..." : "Actualizar"}</button><Link to={`/catalogo/${id}`} className="rounded-md bg-[#e9f0ed] px-4 py-2 text-xs font-bold text-[#23ce6b]">Cancelar</Link></div>
      </form>
    </div>
  );
}
