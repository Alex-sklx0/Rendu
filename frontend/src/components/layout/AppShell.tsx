import { NavLink, Outlet, useLocation } from "react-router-dom";
import clsx from "@/lib/clsx";

export function AppShell() {
  const location = useLocation();

  // Hide header on registration and subproduct pages for a cleaner form experience
  const isFormPage =
    location.pathname.startsWith("/registro") ||
    location.pathname.startsWith("/subproductos/nuevo");

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-full bg-forest-700 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
                <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
                <path d="m14 16-3 3 3 3" />
                <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
                <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 12.013 3a1.784 1.784 0 0 1 1.575.887l3.974 6.835" />
                <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-ink-900 text-lg group-hover:text-forest-700 transition-colors">
              RENDU
            </span>
          </NavLink>

          {/* Navigation pills */}
          <nav className="flex items-center rounded-full bg-surface-50 border border-surface-200 p-1 gap-0.5">
            <NavLink
              to="/registro"
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white text-forest-800 shadow-sm"
                    : "text-ink-500 hover:text-ink-900"
                )
              }
            >
              {/* Person icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Crear cuenta
            </NavLink>
            <NavLink
              to="/subproductos/nuevo"
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white text-forest-800 shadow-sm"
                    : "text-ink-500 hover:text-ink-900"
                )
              }
            >
              {/* Package icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
              Subproducto
            </NavLink>
          </nav>
        </div>

        {/* Gradient line */}
        <div className="header-gradient-line" />
      </header>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="flex-1">
        <div
          className={clsx(
            "mx-auto px-4",
            isFormPage ? "max-w-6xl py-10" : "max-w-2xl py-10"
          )}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
