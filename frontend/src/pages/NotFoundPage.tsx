// Pagina de error 404

import { Link } from "react-router-dom";
import { RenduLogo } from "@/components/ui/RenduLogo";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-[#eef2f0] px-4 py-8">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <RenduLogo size="lg" />
        </div>

        {/* Insignia 404 */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#dff4ed] text-[#00805b]">
          <span className="text-3xl font-black tracking-wider">404</span>
        </div>

        {/* Titulo y texto del error */}
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
          ¡Página no encontrada!
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          Lo sentimos, la página que estás buscando no existe, ha sido movida o la ruta ingresada es incorrecta.
        </p>

        {/* Botones para ir al catalogo o al inicio */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/catalog"
            className="w-full sm:w-auto rounded-xl bg-[#23ce6b] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f]"
          >
            Ir al Catálogo
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto rounded-xl border-2 border-surface-200 bg-white px-6 py-3 text-sm font-bold text-ink-700 transition-colors hover:bg-surface-100"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
