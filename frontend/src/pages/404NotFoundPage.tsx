// Pagina de error 404

import { Link } from "react-router-dom";
import { NotFoundLogo } from "@/components/ui/NotFoundLogo";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <NotFoundLogo size="xl" />
        </div>

        {/* Titulo y texto del error */}
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
          ¡Página no encontrada!
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          Lo sentimos, la página que estás buscando no existe.
        </p>

        {/* Botones para ir al catalogo o al inicio */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="w-full sm:w-auto rounded-xl bg-[#23ce6b] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f]"
          >
            Volver atrás
          </Link>
        </div>
      </div>
    </div>
  );
}
