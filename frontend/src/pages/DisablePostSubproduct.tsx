// Pagina de error 404

import { Link } from "react-router-dom";

export default function DisablePostSubproduct() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-8">
       <div className="mx-auto max-w-xl py-12 text-center">
              <div className="rounded-3xl border border-surface-200 bg-white p-8 shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl text-amber-600">
                  ⚠️
                </div>
                <h2 className="mt-4 text-xl font-bold text-ink-900">
                  Publicación reservada para empresas
                </h2>
                <p className="mt-2 text-sm text-ink-500 leading-relaxed">
                  Las personas naturales y recicladores individuales no pueden publicar subproductos. Esta función está reservada exclusivamente para empresas generadoras o transformadoras.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link
                    to="/catalog"
                    className="rounded-xl bg-[#23ce6b] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#1fb85f]"
                  >
                    Explorar catálogo
                  </Link>
                </div>
              </div>
            </div>
    </div>
  );
}
