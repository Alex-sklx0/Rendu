import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getSubproductoDetalle } from "@/api/client";
import type { SubproductoDetalle } from "@/types";

export default function SubproductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subproducto, setSubproducto] = useState<SubproductoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactado, setContactado] = useState(false);

  useEffect(() => {
    async function loadItem() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getSubproductoDetalle(id);
        setSubproducto(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el detalle.");
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-600 border-t-transparent" />
          <p className="text-sm font-medium text-ink-500">Cargando información del material...</p>
        </div>
      </div>
    );
  }

  if (error || !subproducto) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <span className="text-4xl">⚠️</span>
          <h2 className="mt-3 text-lg font-bold text-red-900">
            {error || "Material no encontrado"}
          </h2>
          <p className="mt-1 text-sm text-red-700">
            El subproducto que buscas no existe o ha sido retirado del catálogo.
          </p>
          <div className="mt-6">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 rounded-xl bg-forest-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-900"
            >
              ← Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pb-16">
      {/* ── Back button ───────────────────────────────────────────── */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/catalogo")}
          className="inline-flex items-center gap-2 text-sm font-bold text-forest-700 transition-colors hover:text-forest-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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

      {/* ── Main Layout Split ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Visual Image Banner */}
        <div className="lg:col-span-5">
          <div className="flex h-72 w-full items-center justify-center overflow-hidden rounded-2xl bg-[#cce9df] shadow-sm lg:h-96">
            {subproducto.image_url ? (
              <img
                src={subproducto.image_url}
                alt={`Foto de ${subproducto.nombre}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[#23ce6b]/60 text-[#23ce6b]" aria-label="Sin fotografía">
                <span className="text-4xl" aria-hidden="true">+</span>
              </div>
            )}
          </div>

          {/* Quick specs pill on mobile/desktop */}
          <div className="mt-4 rounded-xl border border-surface-200 bg-white p-4 text-xs text-ink-500 shadow-sm">
            <div className="flex items-center justify-between">
              <span>Estado:</span>
              <span className="font-semibold text-forest-700">Disponible para retiro</span>
            </div>
            {subproducto.frecuencia && (
              <div className="mt-2 flex items-center justify-between border-t border-surface-100 pt-2">
                <span>Frecuencia de generación:</span>
                <span className="font-semibold text-ink-800">{subproducto.frecuencia}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details & Contact */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
            {/* Category badge */}
            <div className="mb-3">
              <span className="inline-flex items-center rounded-full bg-[#dff4ed] px-3 py-1 text-xs font-bold text-forest-700">
                {subproducto.familia}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
              {subproducto.nombre}
            </h1>

            {/* Company / Publisher */}
            <p className="mt-1 text-sm font-medium text-ink-500">
              Publicación de <span className="font-semibold text-ink-800">{subproducto.usuario || subproducto.empresa}</span>
            </p>

            {/* Stats Boxes */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#f6f8f7] p-4 border border-surface-200">
                <span className="block text-xl font-extrabold text-ink-900">
                  {subproducto.volumen_disponible.toLocaleString("es-CO")} {subproducto.unidad_volumen}
                </span>
                <span className="text-xs font-medium text-ink-500">Cantidad disponible</span>
              </div>

              <div className="rounded-xl bg-[#f6f8f7] p-4 border border-surface-200">
                <span className="block text-xl font-extrabold text-ink-900">
                  {subproducto.municipio}
                </span>
                <span className="text-xs font-medium text-ink-500">Ubicación</span>
              </div>
            </div>

            {/* Description Section */}
            <div className="mt-6 border-t border-surface-100 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-700">
                Descripción
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {subproducto.descripcion}
              </p>
            </div>

            {/* Conditions Section */}
            <div className="mt-6 border-t border-surface-100 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-700">
                Condiciones
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {subproducto.condiciones}
              </p>
            </div>

            {/* CTA Contact Button */}
            <div className="mt-8 border-t border-surface-100 pt-6">
              {contactado ? (
                <div className="rounded-xl bg-[#dff4ed] p-4 text-center text-sm font-semibold text-forest-800">
                  ✅ Solicitud enviada a {subproducto.empresa}. Te contactarán a la brevedad.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setContactado(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#23ce6b] px-6 py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f] active:scale-[0.99]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Contactar empresa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
