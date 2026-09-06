import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-8">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-forest-600 mb-3">
          Economía Circular
        </p>
        <h1 className="text-3xl font-bold text-ink-900 mb-3">
          Mercado digital de subproductos industriales
        </h1>
        <p className="text-ink-500 max-w-md mx-auto leading-relaxed">
          Conecta empresas del Valle de Aburrá para dar una segunda vida a materiales que hoy
          terminan como residuo.
        </p>
      </div>

      {/* Quick action cards */}
      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
        <Link
          to="/registro"
          className="card group hover:border-forest-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-forest-700/10 flex items-center justify-center text-forest-700 group-hover:bg-forest-700 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-ink-900">Crear cuenta</h2>
              <p className="text-sm text-ink-500">Regístrate para empezar</p>
            </div>
          </div>
        </Link>

        <Link
          to="/subproductos/nuevo"
          className="card group hover:border-forest-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-clay-400/10 flex items-center justify-center text-clay-500 group-hover:bg-clay-500 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-ink-900">Publicar subproducto</h2>
              <p className="text-sm text-ink-500">Registra el material que ofreces</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
