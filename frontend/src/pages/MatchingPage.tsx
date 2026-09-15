import { Link } from "react-router-dom";

export default function MatchingPage() {
  return (
    <div className="mx-auto max-w-4xl py-12 text-center">
      <div className="rounded-3xl border border-surface-200 bg-white p-12 shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#dff4ed] text-4xl text-[#23ce6b]">
          ↔
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-ink-900 sm:text-3xl">
          Matching de subproductos
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500 leading-relaxed">
          Encuentra coincidencias automáticas entre las necesidades de materiales de
          transformadores y la oferta de empresas generadoras.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-xl bg-[#23ce6b] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f]"
          >
            Explorar catálogo
          </Link>
          <Link
            to="/publicar"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-6 py-3 text-sm font-bold text-ink-700 transition-colors hover:bg-surface-100"
          >
            + Publicar material
          </Link>
        </div>
      </div>
    </div>
  );
}
