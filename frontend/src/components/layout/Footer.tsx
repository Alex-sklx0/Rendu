// Componente de pie de pagina (Footer) de la plataforma

import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-surface-200 bg-white rounded-t-[30px] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo y descripción */}
          <div className="md:col-span-2 space-y-4">
            <p className="text-2xl font-bold text-[#23ce6b]">RENDU</p>
            <p className="max-w-md text-sm leading-relaxed text-ink-700">
              Plataforma de economía circular para la valorización, aprovechamiento y conexión directa de subproductos industriales en el Valle de Aburrá.
            </p>
            <div className="flex items-center text-sm font-semibold text-[#00805b] py-2.5 rounded-full w-fit">
              <span>Comprometidos con el desarrollo sostenible</span>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-forest-900">
              Plataforma
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/catalog"
                  className="text-ink-600 transition-colors hover:text-[#23ce6b] font-medium"
                >
                  Catálogo de subproductos
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-ink-600 transition-colors hover:text-[#23ce6b] font-medium"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-ink-600 transition-colors hover:text-[#23ce6b] font-medium"
                >
                  Contáctanos
                </Link>
              </li>
            </ul>
          </div>

          {/* Ubicación y Soporte */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-forest-900">
              Cobertura
            </h4>
            <p className="text-sm text-ink-600 leading-relaxed">
              10 municipios del Valle de Aburrá, Antioquia, Colombia.
            </p>
            <p className="text-sm text-ink-600">
              ✉️{" "}
              <a
                href="mailto:contacto@rendu.com.co"
                className="text-forest-700 hover:text-[#23ce6b] transition-colors font-medium underline-offset-2 hover:underline"
              >
                contacto@rendu.com.co
              </a>
            </p>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-surface-100 pt-6 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Rendu. Todos los derechos reservados.</p>
          </div>
      </div>
    </footer>
  );
}
