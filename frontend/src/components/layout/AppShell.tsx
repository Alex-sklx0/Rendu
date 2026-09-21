// Estructura principal de la app con encabezado y contenido

import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { RenduLogo } from "@/components/ui/RenduLogo";
import notifyImg from "@/img/notify.png";

export function AppShell() {
  const location = useLocation();

  const isStandaloneScreen = location.pathname === "/" || [
    "/splash",
    "/splash1",
    "/splash2",
    "/splash3",
    "/login",
    "/pre-register",
    "/person-registration",
    "/company-registration",
    "/communication",
  ].some((path) => location.pathname === path || location.pathname.startsWith(path + "/"));

  const isAuthenticated = typeof window !== "undefined" && Boolean(localStorage.getItem("isAuthenticated"));
  const storedUserStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let isPersona = false;
  if (storedUserStr) {
    try {
      const parsed = JSON.parse(storedUserStr);
      if (!parsed?.id_empresa) isPersona = true;
    } catch {
      // Ignorar error de JSON parse
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      {/* Encabezado superior */}
      {!isStandaloneScreen && (
        <header className="sticky top-0 z-40 bg-white shadow-lg border-b border-surface-200 rounded-b-[30px]">
          <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
            {/* Logo de Rendu a la izquierda */}
            <NavLink to="/catalog" className="flex items-center gap-2 justify-self-start group">
              <RenduLogo size="header" showText={false} />
            </NavLink>

            {/* Navegacion principal */}
            <nav className="flex items-center gap-2 justify-self-center sm:gap-3">
              {/* Boton para publicar, oculto para usuarios persona */}
              {!isPersona && (
                <NavLink
                  to={isAuthenticated ? "/post-subproduct" : "/login"}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                      isActive
                        ? "bg-[#23ce6b] text-white shadow-sm"
                        : "bg-[#dff4ed] text-[#18322d] hover:bg-[#cdeee3]"
                    }`
                  }
                >
                  <span className="text-base font-extrabold">+</span>
                  <span>Publicar</span>
                </NavLink>
              )}

              {/* Enlace al catalogo */}
              <NavLink
                to="/catalog"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#23ce6b] text-white shadow-sm"
                      : "bg-[#dff4ed] text-[#18322d] hover:bg-[#cdeee3]"
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Catalogo</span>
              </NavLink>

              {/* Enlace al matching */}
              <NavLink
                to="/matching"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#23ce6b] text-white shadow-sm"
                      : "bg-[#dff4ed] text-[#18322d] hover:bg-[#cdeee3]"
                  }`
                }
              >
                <span className="text-base font-extrabold">↔</span>
                <span>Matching</span>
              </NavLink>
            </nav>

            {/* Notificaciones y avatar del usuario */}
            <div className="flex items-center gap-3 justify-self-end">
              {/* Icono de notificaciones */}
              <button
                type="button"
                className="relative rounded-full p-2 text-ink-900 transition-colors hover:bg-surface-100"
                aria-label="Notificaciones"
              >
                <img
                  src={notifyImg}
                  alt="Notificaciones"
                  className="h-12 w-12 object-contain"
                />
              </button>

              {/* Avatar del usuario, lleva al perfil o al login */}
              <Link
                to={isAuthenticated ? "/profile" : "/login"}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d9d9d9] text-ink-700 transition-transform hover:scale-105 overflow-hidden shadow-inner"
                title={isAuthenticated ? "Mi cuenta / Perfil" : "Iniciar sesión"}
                aria-label="Perfil de usuario"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#18322d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Contenido principal de la pagina */}
      <main className="flex-1">
        {isStandaloneScreen ? (
          <Outlet />
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}
