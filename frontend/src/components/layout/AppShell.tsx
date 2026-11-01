import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import catalogIcon from "@/img/catalog.svg";
import userIcon from "@/img/user-black.svg";
import { RenduLogo } from "@/components/ui/RenduLogo";
import { RubberSegment } from "@/components/ui/RubberSegment";
import { Footer } from "@/components/layout/Footer";
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

  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const str = localStorage.getItem("user");
      const user = str ? JSON.parse(str) : null;
      if (user?.id) {
        return localStorage.getItem(`user_avatar_${user.id}`) || user.avatar_url || null;
      }
    } catch {
      return null;
    }
    return null;
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
              es_admin: Boolean(res.usuario.es_admin),
              municipio: res.empresa?.municipio || res.persona?.municipio,
            };
            setCurrentUser(updated);
            const cachedAvatar =
              localStorage.getItem(`user_avatar_${res.usuario.id}`) ||
              (res.usuario as any).avatar_url ||
              null;
            setAvatarUrl(cachedAvatar);
          }
        })
        .catch(() => {
          setCurrentUser(null);
          setAvatarUrl(null);
        });
    } else {
      setCurrentUser(null);
      setAvatarUrl(null);
    }
  }, [location.pathname]);

  // Escuchar evento personalizado cuando se actualiza la foto de perfil
  useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      if (e?.detail) {
        setAvatarUrl(e.detail);
      } else {
        try {
          const str = localStorage.getItem("user");
          const user = str ? JSON.parse(str) : null;
          if (user?.id) {
            setAvatarUrl(localStorage.getItem(`user_avatar_${user.id}`) || user.avatar_url || null);
          }
        } catch {
          setAvatarUrl(null);
        }
      }
    };

    window.addEventListener("rendu_avatar_changed", handleAvatarUpdate);
    window.addEventListener("storage", handleAvatarUpdate);
    return () => {
      window.removeEventListener("rendu_avatar_changed", handleAvatarUpdate);
      window.removeEventListener("storage", handleAvatarUpdate);
    };
  }, []);

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
    "/register",
    "/disable-post-subproduct",
    "/admin",
    "/about",
    "/contact",
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

  const isAuthenticated = typeof window !== "undefined" && Boolean(getToken()) && Boolean(currentUser);
  const isCatalogNavigationActive =
    location.pathname === "/catalog" || location.pathname.startsWith("/catalog/");

  const isEmpresa = isAuthenticated && Boolean(currentUser?.id_empresa);
  const isAdmin = isAuthenticated && Boolean(currentUser?.es_admin);

  const navigationItems = [
    ...(isEmpresa
      ? [{
          value: "publish",
          label: "Publicar",
          path: "/post-subproduct",
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
    ...(isAdmin
      ? [{
          value: "admin",
          label: "Admin",
          path: "/admin",
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
        }]
      : []),
  ];
  const isPrimaryNavigationRoute = ["/catalog", "/post-subproduct", "/admin"].some(
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

              {/* Avatar del usuario, lleva al perfil o al login */}
              <Link
                to={isAuthenticated ? "/profile" : "/login"}
                className={`flex h-12 w-12 items-center justify-center rounded-full text-ink-700 transition-transform hover:scale-105 overflow-hidden shadow-inner ${
                  isAuthenticated && avatarUrl
                    ? "ring-2 ring-[#23ce6b]/50 bg-white"
                    : "bg-[#d9d9d9]"
                }`}
                title={isAuthenticated ? "Mi cuenta / Perfil" : "Iniciar sesión"}
                aria-label="Perfil de usuario"
              >
                {isAuthenticated && avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={currentUser?.nombre || "Perfil de usuario"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img src={userIcon} width="24" height="24" aria-hidden="true" alt="" />
                )}
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

      {/* Pie de pagina */}
      {!isStandaloneScreen && <Footer />}
    </div>
  );
}
