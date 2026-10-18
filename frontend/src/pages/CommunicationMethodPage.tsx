// Pagina para que las empresas elijan su medio de contacto preferido desde la base de datos
// Muestra un carousel animado con los medios consultados dinamicamente

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RenduLogo } from "@/components/ui/RenduLogo";
import { getMediosContacto } from "@/api/client";
import type { MedioContacto } from "@/types";
import instagramIcon from "@/img/social-instagram.svg";
import whatsappIcon from "@/img/social-whatsapp.svg";
import telegramIcon from "@/img/social-telegram.svg";
import emailIcon from "@/img/social-email.svg";
import phoneIcon from "@/img/social-phone.svg";

// Estilos e iconos dinamicos segun el nombre del medio proveniente de la BD
interface MethodVisuals {
  gradient: string;
  gradientBg: string;
  icon: string;
  badge?: string;
  subtitle: string;
  accentColor: string;
}

function resolveMethodVisuals(nombre: string): MethodVisuals {
  const norm = nombre.toLowerCase().trim();

  if (norm.includes("whatsapp")) {
    return {
      gradient: "from-[#25D366] to-[#128C7E]",
      gradientBg: "from-[#25D366]/10 via-[#128C7E]/5 to-transparent",
      icon: whatsappIcon,
      badge: "Recomendado",
      subtitle: "Número celular o enlace directo de chat",
      accentColor: "#25D366",
    };
  }

  if (norm.includes("instagram")) {
    return {
      gradient: "from-[#f9ed32] via-[#ee2a7b] to-[#002aff]",
      gradientBg: "from-[#ee2a7b]/10 via-[#f9ed32]/5 to-transparent",
      icon: instagramIcon,
      subtitle: "Perfil de empresa (@usuario) o enlace directo",
      accentColor: "#ee2a7b",
    };
  }

  if (norm.includes("correo") || norm.includes("email") || norm.includes("mail")) {
    return {
      gradient: "from-[#ea4335] to-[#fbbc05]",
      gradientBg: "from-[#ea4335]/10 via-[#fbbc05]/5 to-transparent",
      icon: emailIcon,
      subtitle: "Dirección de correo corporativo para solicitudes",
      accentColor: "#ea4335",
    };
  }

  if (norm.includes("tel") || norm.includes("cel") || norm.includes("llamada") || norm.includes("movil")) {
    return {
      gradient: "from-[#3b82f6] to-[#1d4ed8]",
      gradientBg: "from-[#3b82f6]/10 via-[#1d4ed8]/5 to-transparent",
      icon: phoneIcon,
      subtitle: "Número de teléfono fijo o móvil corporativo",
      accentColor: "#3b82f6",
    };
  }

  if (norm.includes("telegram")) {
    return {
      gradient: "from-[#229ED9] to-[#0088cc]",
      gradientBg: "from-[#229ED9]/10 via-[#0088cc]/5 to-transparent",
      icon: telegramIcon,
      subtitle: "Usuario de Telegram (@usuario) o enlace t.me",
      accentColor: "#229ED9",
    };
  }

  // Fallback para nuevos medios añadidos en la BD
  return {
    gradient: "from-[#10b981] to-[#059669]",
    gradientBg: "from-[#10b981]/10 via-[#059669]/5 to-transparent",
    icon: emailIcon,
    subtitle: "Canal oficial de contacto empresarial",
    accentColor: "#10b981",
  };
}

// Icono de flecha tipo chevron inline
function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

export default function CommunicationMethodPage() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState<MedioContacto[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Consulta de medios disponibles a la base de datos
  useEffect(() => {
    let isMounted = true;
    getMediosContacto()
      .then((data) => {
        if (isMounted) setMethods(data);
      })
      .catch((err) => {
        console.error("Error al cargar medios de contacto:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Avance automatico del carousel cada 4 segundos
  const startAutoTimer = useCallback(() => {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      if (methods.length > 1) goTo("right");
    }, 4000);
  }, [methods.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && methods.length > 1) startAutoTimer();
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [loading, methods, startAutoTimer]);

  // Navegar entre tarjetas con animacion suave
  function goTo(dir: "left" | "right") {
    if (isAnimating || methods.length <= 1) return;
    setIsAnimating(true);
    setAnimDir(dir);
    setTimeout(() => {
      setActiveIndex((prev) => {
        if (dir === "right") return (prev + 1) % methods.length;
        return (prev - 1 + methods.length) % methods.length;
      });
      setAnimDir(null);
      setIsAnimating(false);
    }, 260);
    startAutoTimer();
  }

  function jumpTo(idx: number) {
    if (isAnimating || idx === activeIndex) return;
    const dir = idx > activeIndex ? "right" : "left";
    setIsAnimating(true);
    setAnimDir(dir);
    setTimeout(() => {
      setActiveIndex(idx);
      setAnimDir(null);
      setIsAnimating(false);
    }, 260);
    startAutoTimer();
  }

  function handleSelect() {
    const method = methods[activeIndex];
    if (!method) return;
    localStorage.setItem("selected_contact_method", method.nombre);
    localStorage.setItem("selected_contact_method_id", String(method.id));
    navigate(`/communication?method=${encodeURIComponent(method.nombre)}`, {
      state: { method: method.nombre, id_medio: method.id },
    });
  }

  const activeMethod = methods[activeIndex];
  const visuals = activeMethod ? resolveMethodVisuals(activeMethod.nombre) : null;

  // Calculos para las tarjetas en posicion previa y siguiente (efecto profundidad)
  const prevIndex = (activeIndex - 1 + methods.length) % methods.length;
  const nextIndex = (activeIndex + 1) % methods.length;

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-[#eef2f0] px-4 py-10">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl sm:p-14 overflow-hidden">
        {/* Decoraciones en las esquinas estilo splash */}
        <div className="pointer-events-none absolute left-6 top-6 h-12 w-24 rounded-tl-2xl border-l-4 border-t-4 border-[#23ce6b]" />
        <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-36 rounded-bl-2xl border-b-4 border-l-4 border-[#23ce6b]" />

        {/* Fondo de color dinamico segun el medio activo */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${visuals?.gradientBg ?? ""} transition-all duration-700`}
        />

        {/* Logo */}
        <div className="relative z-10 flex justify-center mb-6">
          <RenduLogo size="lg" />
        </div>

        {/* Titulo */}
        <div className="relative z-10 mx-auto max-w-xl text-center mb-10">
          <h1 className="text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">
            ¿Por cuál medio prefieres que te contacten?
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-ink-600">
            Desliza y elige el canal oficial que utilizarán tus aliados comerciales.
          </p>
        </div>

        {/* ─── Área del carousel ─── */}
        {loading ? (
          <div className="my-14 flex flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#23ce6b] border-t-transparent" />
            <p className="text-sm font-medium text-ink-500">Cargando medios de contacto...</p>
          </div>
        ) : methods.length === 0 ? (
          <div className="my-14 text-center text-sm text-ink-400">
            No hay medios de contacto disponibles por el momento.
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-6 select-none">
            {/* Tarjetas del carousel */}
            <div className="relative flex items-center justify-center w-full h-56">
              {/* Tarjeta previa — decorativa, fondo izquierdo */}
              {methods.length > 1 && (() => {
                const prev = methods[prevIndex];
                const pv = resolveMethodVisuals(prev.nombre);
                return (
                  <button
                    type="button"
                    onClick={() => goTo("left")}
                    aria-label={`Ver ${prev.nombre}`}
                    className="absolute left-0 sm:left-2 z-10 flex flex-col items-center justify-center gap-2 w-24 h-44 rounded-2xl border-2 border-surface-200 bg-white/60 shadow-sm opacity-50 scale-90 blur-[1px] cursor-pointer transition-all hover:opacity-70"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${pv.gradient} p-0.5 shadow`}>
                      <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-white">
                        <img src={pv.icon} alt={prev.nombre} width={24} height={24} />
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-ink-500 text-center leading-tight px-1">
                      {prev.nombre}
                    </span>
                  </button>
                );
              })()}

              {/* Tarjeta activa — centrada y destacada */}
              <div
                className="relative z-20 flex flex-col items-center justify-between gap-4 w-52 h-52 rounded-3xl border-2 bg-white shadow-2xl px-5 py-6 mx-4 sm:mx-6 transition-all duration-300 cursor-pointer"
                style={{
                  borderColor: visuals?.accentColor ?? "#23ce6b",
                  boxShadow: `0 8px 32px 0 ${visuals?.accentColor ?? "#23ce6b"}33`,
                  transform: animDir === "right"
                    ? "translateX(-30px) scale(0.94) opacity(0)"
                    : animDir === "left"
                    ? "translateX(30px) scale(0.94) opacity(0)"
                    : "translateX(0) scale(1)",
                  opacity: isAnimating ? 0 : 1,
                  transition: "transform 260ms cubic-bezier(.4,0,.2,1), opacity 260ms ease, box-shadow 600ms ease",
                }}
                onClick={handleSelect}
              >
                {/* Badge */}
                {visuals?.badge && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-extrabold text-white shadow"
                    style={{ backgroundColor: visuals.accentColor }}
                  >
                    {visuals.badge}
                  </span>
                )}

                {/* Icono grande */}
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr ${visuals?.gradient} p-0.5 shadow-lg`}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-[18px] bg-white">
                    <img
                      src={visuals?.icon}
                      alt={activeMethod?.nombre}
                      width={42}
                      height={42}
                    />
                  </div>
                </div>

                {/* Nombre y subtítulo */}
                <div className="text-center">
                  <p className="text-lg font-extrabold text-ink-900">{activeMethod?.nombre}</p>
                  
                </div>

                {/* Hint de click */}
                <p
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: visuals?.accentColor }}
                >
                  Toca para seleccionar →
                </p>
              </div>

              {/* Tarjeta siguiente — decorativa, fondo derecho */}
              {methods.length > 1 && (() => {
                const next = methods[nextIndex];
                const nv = resolveMethodVisuals(next.nombre);
                return (
                  <button
                    type="button"
                    onClick={() => goTo("right")}
                    aria-label={`Ver ${next.nombre}`}
                    className="absolute right-0 sm:right-2 z-10 flex flex-col items-center justify-center gap-2 w-24 h-44 rounded-2xl border-2 border-surface-200 bg-white/60 shadow-sm opacity-50 scale-90 blur-[1px] cursor-pointer transition-all hover:opacity-70"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${nv.gradient} p-0.5 shadow`}>
                      <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-white">
                        <img src={nv.icon} alt={next.nombre} width={24} height={24} />
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-ink-500 text-center leading-tight px-1">
                      {next.nombre}
                    </span>
                  </button>
                );
              })()}
            </div>

            {/* Botones de navegación */}
            {methods.length > 1 && (
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => goTo("left")}
                  disabled={isAnimating}
                  aria-label="Anterior"
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-200 bg-white text-ink-400 shadow-sm transition-all hover:border-[#23ce6b] hover:text-[#23ce6b] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronIcon dir="left" />
                </button>

                {/* Indicadores de posicion (dots) */}
                <div className="flex items-center gap-2">
                  {methods.map((m, i) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => jumpTo(i)}
                      aria-label={`Ir a ${m.nombre}`}
                      className="rounded-full transition-all duration-300 cursor-pointer"
                      style={{
                        width: i === activeIndex ? 28 : 8,
                        height: 8,
                        backgroundColor: i === activeIndex
                          ? (visuals?.accentColor ?? "#23ce6b")
                          : "#d1d5db",
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => goTo("right")}
                  disabled={isAnimating}
                  aria-label="Siguiente"
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface-200 bg-white text-ink-400 shadow-sm transition-all hover:border-[#23ce6b] hover:text-[#23ce6b] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronIcon dir="right" />
                </button>
              </div>
            )}
          </div>
        )}

        
      </div>
    </div>
  );
}
