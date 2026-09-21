import { Link } from "react-router-dom";
import type { SubproductoCatalogo } from "@/types";

interface SubproductCardProps {
  subproducto: SubproductoCatalogo;
}

export function SubproductCard({ subproducto }: SubproductCardProps) {
  const isDisponible = subproducto.disponible !== false;

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 ${
      isDisponible
        ? "border-surface-200 hover:shadow-[0_12px_24px_rgba(35,206,107,0.28)]"
        : "border-amber-200 bg-amber-50/10 hover:shadow-[0_12px_24px_rgba(217,119,6,0.2)]"
    }`}>
      {/* ── Visual Banner / Publisher Image ─────────────────────── */}
      <div className="relative flex h-36 w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#dceee8] to-[#b9ddd0]">
        {!isDisponible && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-600/95 px-2.5 py-1 text-xs font-extrabold tracking-wide text-white shadow-md backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-amber-200 animate-pulse" />
              Sin stock
            </span>
          </div>
        )}
        {subproducto.image_url ? (
          <img
            src={subproducto.image_url}
            alt={`Foto de ${subproducto.nombre}`}
            className={`h-full w-full object-cover transition-transform duration-200 hover:scale-105 ${
              !isDisponible ? "grayscale-[30%] opacity-85" : ""
            }`}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#23ce6b]/60 text-[#23ce6b]" aria-label="Sin fotografía">
            <span className="text-2xl" aria-hidden="true">+</span>
          </div>
        )}
      </div>

      {/* ── Content Details ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category & Status Badge */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-[#dff4ed] px-2.5 py-0.5 text-xs font-bold text-forest-700">
            {subproducto.familia}
          </span>
          {!isDisponible && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
              No disponible
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="line-clamp-1 text-lg font-bold text-ink-900">
          {subproducto.nombre}
        </h3>

        {/* Quantity */}
        <p className="mt-1 text-xl font-extrabold text-ink-900">
          {subproducto.volumen_disponible.toLocaleString("es-CO")}{" "}
          <span className="text-sm font-medium text-ink-600">
            {subproducto.unidad_volumen}
          </span>
        </p>

        {/* Company & Location */}
        <p className="mt-1 text-xs text-ink-500">
          {subproducto.empresa} · {subproducto.municipio}
        </p>

        {/* Action Button */}
        <div className="mt-5 pt-2">
          <Link
            to={`/catalog/${subproducto.id}`}
            className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors ${
              isDisponible
                ? "bg-[#23ce6b] hover:bg-forest-800"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </div>
  );
}
