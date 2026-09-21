// Pagina de matching de subproductos


export default function MatchingPage() {
  return (
    <div className="mx-auto max-w-4xl py-12 text-center">
      <div className="rounded-3xl border border-surface-200 bg-white p-12 shadow-sm">
        {/* Icono de matching */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#dff4ed] text-4xl text-[#23ce6b]">
          ↔
        </div>

        {/* Titulo y descripcion */}
        <h1 className="mt-6 text-2xl font-extrabold text-ink-900 sm:text-3xl">
          Matching de subproductos
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500 leading-relaxed">
          Aún en construcción...
        </p>
      </div>
    </div>
  );
}
