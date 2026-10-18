import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import catalogIcon from "@/img/catalog.svg";
import userIcon from "@/img/user-black.svg";
import notifyImg from "@/img/notify.svg";
import { RenduLogo } from "@/components/ui/RenduLogo";
import { RubberSegment } from "@/components/ui/RubberSegment";
import { getMe, getToken } from "@/api/client";

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window === "undefined") return null;
    const str = localStorage.getItem("user");
    try {
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  });

  // Restaurar sesion real al cargar o recargar
  useEffect(() => {
    if (getToken()) {
      getMe()
        .then((res) => {
          if (res?.usuario) {
            const updated = {
              id: res.usuario.id,
              email: res.usuario.email,
              nombre:
                res.usuario.nombre ||
                res.empresa?.nombre ||
                res.persona?.nombre ||
                res.usuario.email.split("@")[0],
              id_empresa: res.usuario.id_empresa ?? res.empresa?.id ?? null,
              tipo: res.tipo,
              municipio: res.empresa?.municipio || res.persona?.municipio,
            };
            setCurrentUser(updated);
          }
        })
        .catch(() => {
          setCurrentUser(null);
        });
    }
  }, [location.pathname]);

  const knownRoutePrefixes = [
    "/splash",
    "/login",
    "/pre-register",
    "/person-registration",
    "/company-registration",
    "/communication",
    "/communication-method",
    "/catalog",
    "/profile",
    "/subproduct",
    "/subproducts",
    "/post-subproduct",
    "/matching",
    "/register",
    "/disable-post-subproduct",
  ];
  const isKnownRoute =
    location.pathname === "/" ||
    knownRoutePrefixes.some(
      (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
    );
  const isStandaloneScreen = !isKnownRoute || location.pathname === "/" || [
    "/splash",
    "/splash1",
    "/splash2",
    "/splash3",
    "/login",
    "/pre-register",
    "/person-registration",
    "/company-registration",
    "/communication",
    "/communication-method",
  ].some((path) => location.pathname === path || location.pathname.startsWith(path + "/"));

  const isAuthenticated = typeof window !== "undefined" && Boolean(getToken());
  const isCatalogNavigationActive =
    location.pathname === "/catalog" || location.pathname.startsWith("/catalog/");
  const isPersona = Boolean(currentUser && !currentUser.id_empresa);
  const navigationItems = [
    ...(!isPersona
      ? [{
          value: "publish",
          label: "Publicar",
          path: isAuthenticated ? "/post-subproduct" : "/login",
          icon: <span aria-hidden="true" className="text-base font-extrabold">+</span>,
        }]
      : []),
    {
      value: "catalog",
      label: "Catalogo",
      path: "/catalog",
      icon: (
        <img
          src={catalogIcon}
          width="16"
          height="16"
          aria-hidden="true"
          alt=""
          className={isCatalogNavigationActive ? "brightness-0 invert" : ""}
        />
      ),
    },
    {
      value: "matching",
      label: "Matching",
      path: "/matching",
      icon: <span aria-hidden="true" className="text-base">↔</span>,
    },
  ];
  const isPrimaryNavigationRoute = ["/catalog", "/post-subproduct", "/matching"].some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
  );
  const activeNavigationValue = isPrimaryNavigationRoute
    ? navigationItems.find((item) => location.pathname.startsWith(item.path))?.value ?? ""
    : "";

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
            <nav className="flex items-center justify-self-center">
              <RubberSegment
                items={navigationItems}
                value={activeNavigationValue}
                onChange={(value) => {
                  const item = navigationItems.find((entry) => entry.value === value);
                  if (item) navigate(item.path);
                }}
                ariaLabel="Navegación principal"
              />
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
                <img src={userIcon} width="24" height="24" aria-hidden="true" alt="" />
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
