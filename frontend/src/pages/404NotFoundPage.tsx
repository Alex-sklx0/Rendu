// Pagina de error 404

import { Link } from "react-router-dom";
import { NotFoundLogo } from "@/components/ui/NotFoundLogo";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-12 text-center sm:p-16">
        {/* Logo */}
        <div className="mb-1 flex justify-center">
          <NotFoundLogo size="xl" />
        </div>

        {/* Titulo y texto del error */}
        <h1 className="text-4xl font-extrabold text-ink-900 sm:text-5xl">
          ¡Página no encontrada!
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-500 sm:text-xl">
          Lo sentimos, la página que estás buscando no existe.
        </p>

        {/* Botones para ir al catalogo o al inicio */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="w-full rounded-2xl bg-[#23ce6b] px-8 py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f] sm:w-auto sm:text-lg"
          >
            Volver atrás
          </Link>
        </div>
      </div>
    </div>
  );
}
