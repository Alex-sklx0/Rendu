import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMisPublicaciones } from "@/api/client";
import type { SubproductoDetalle } from "@/types";

export default function ProfilePage() {
  const [publicaciones, setPublicaciones] = useState<SubproductoDetalle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMisPublicaciones()
      .then(setPublicaciones)
      .finally(() => setLoading(false));
  }, []);

  const totalKg = publicaciones.reduce(
    (total, publicacion) => total + (publicacion.unidad_volumen === "kg" ? publicacion.volumen_disponible : 0),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Mi nombre</h1>
        <p className="mt-1 text-sm text-ink-500">Gestiona publicaciones, contactos e historial.</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.05fr_1.05fr_0.7fr]">
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-surface-200">
          <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff4ed] font-bold text-[#00805b]">F</div>
            <div>
              <h2 className="font-bold text-ink-900">Fibretex</h2>
              <p className="text-xs text-ink-500">Textil · Medellín</p>
            </div>
          </div>
          <dl className="mt-3 space-y-2 text-xs text-ink-500">
            <div><dt className="inline font-bold text-ink-700">Tipo: </dt><dd className="inline">Generador y aprovechador</dd></div>
            <div><dt className="inline font-bold text-ink-700">Contacto: </dt><dd className="inline">contacto@fibretex.co</dd></div>
          </dl>
          <button type="button" className="mt-3 rounded-md border border-[#00805b] px-3 py-1.5 text-xs font-bold text-[#00805b]">Editar perfil</button>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-surface-200">
          <h2 className="text-xs font-bold text-ink-700">Resumen</h2>
          <div className="mt-3 grid grid-cols-2 gap-y-4">
            <div><strong className="block text-xl text-ink-900">{publicaciones.length}</strong><span className="text-xs text-ink-500">Publicaciones</span></div>
            <div><strong className="block text-xl text-ink-900">12</strong><span className="text-xs text-ink-500">Matches</span></div>
            <div><strong className="block text-xl text-ink-900">3</strong><span className="text-xs text-ink-500">Contactos</span></div>
            <div><strong className="block text-xl text-ink-900">{(totalKg / 1000).toFixed(1)} t</strong><span className="text-xs text-ink-500">Material aprovechado</span></div>
          </div>
        </section>

        <section className="hidden min-h-[190px] items-end justify-center gap-3 bg-[#f3f4f5] p-5 lg:flex">
          {[35, 58, 72, 94].map((height) => <span key={height} className="w-7 bg-[#00a957]" style={{ height: `${height}px` }} />)}
        </section>
      </div>

      <section className="mt-2 rounded-xl bg-white p-5 shadow-sm ring-1 ring-surface-200">
        <h2 className="mb-4 text-sm font-bold text-ink-900">Mis publicaciones</h2>
        {loading ? <p className="py-8 text-center text-sm text-ink-500">Cargando publicaciones...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="border-b border-surface-200 text-ink-700">
                <tr><th className="px-2 py-2 font-bold">Material</th><th className="px-2 py-2 font-bold">Cantidad</th><th className="px-2 py-2 font-bold">Estado</th><th className="px-2 py-2 font-bold">Matches</th><th className="px-2 py-2" /></tr>
              </thead>
              <tbody>
                {publicaciones.slice(0, 6).map((publicacion, index) => (
                  <tr key={publicacion.id} className="border-b border-surface-100 text-ink-600">
                    <td className="px-2 py-2 font-semibold">{publicacion.nombre}</td>
                    <td className="px-2 py-2">{publicacion.volumen_disponible} {publicacion.unidad_volumen}</td>
                    <td className="px-2 py-2"><span className="rounded-full bg-[#dff4ed] px-2 py-1 font-bold text-[#00805b]">Activa</span></td>
                    <td className="px-2 py-2">{[6, 3, 2][index] ?? 0}</td>
                    <td className="px-2 py-2 text-right"><Link to={`/subproductos/${publicacion.id}/editar`} className="font-bold text-[#00805b] hover:underline">Editar</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-2 max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-surface-200">
        <div className="flex items-start justify-between gap-6">
          <div><h2 className="font-bold text-ink-900">Certificaciones</h2><p className="mt-3 text-sm leading-tight text-ink-700">Para generar un certificado de cumplimiento ambiental debes cumplir 500 kg aprovechados.</p></div>
          <div className="shrink-0 text-right"><p className="text-xs font-bold text-ink-900">Cantidad aprovechada.</p><div className="mt-4 rounded-md border-b-2 border-ink-900 px-3 py-2 text-xs font-bold">1.2 toneladas<br /><span className="font-normal">500 kg</span></div></div>
        </div>
        <button type="button" className="mt-4 ml-auto block rounded-md bg-[#23ce6b] px-5 py-2 text-xs font-bold text-white">Descargar certificado</button>
      </section>
    </div>
  );
}
