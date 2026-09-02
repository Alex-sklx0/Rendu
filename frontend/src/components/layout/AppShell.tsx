import { NavLink, Outlet } from "react-router-dom";
import clsx from "@/lib/clsx";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/registro/usuario", label: "Crear cuenta" },
  { to: "/registro/empresa", label: "Registrar empresa" },
  { to: "/subproductos/nuevo", label: "Publicar subproducto" },
];

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-surface-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-md bg-forest-700" aria-hidden />
            <span className="font-semibold tracking-tight text-ink-900">RENDU</span>
          </NavLink>
          <nav className="flex gap-1">
            {links.slice(1).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-forest-700/10 text-forest-800"
                      : "text-ink-700 hover:bg-surface-100"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-surface-200 py-6">
        <div className="mx-auto max-w-5xl px-4 text-sm text-ink-500">
          RENDU — Proyecto Aplicado en TIC, UPB. Prototipo académico.
        </div>
      </footer>
    </div>
  );
}
