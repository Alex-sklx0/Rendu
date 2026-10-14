import { useState, useEffect } from "react";
import inlineSvg8 from "@/img/arrow-white.svg";
import { useNavigate } from "react-router-dom";
import { SocialNetworkIcons } from "@/components/ui/social_network_icons";
import { RenduLogo } from "@/components/ui/RenduLogo";

export default function CommunicationPage() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Efecto de bucle para cambiar de red social cada 1.2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % SocialNetworkIcons.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const currentSocial = SocialNetworkIcons[currentIndex];

  // Detección de cuando escriben solo "WhatsApp" o nombres genericos en vez de datos reales
  const isOnlyGenericWord = /^(whatsapp|wasap|wpp|whastapp|watsapp|celular|telefono|tel|llamada)$/i.test(handle.trim());

  function handleContinue() {
    if (isOnlyGenericWord) {
      return;
    }
    // Guardar medio de contacto en usuario local si existe
    const storedUser = localStorage.getItem("user");
    if (storedUser && handle.trim()) {
      try {
        const parsed = JSON.parse(storedUser);
        parsed.medio_contacto = handle.trim();
        localStorage.setItem("user", JSON.stringify(parsed));
      } catch {
        // Ignorar error
      }
    }
    navigate("/catalog");
  }

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-[#eef2f0] px-4 py-10">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl sm:p-14">
        {/* Decoraciones en las esquinas estilo splash */}
        <div className="pointer-events-none absolute left-6 top-6 h-12 w-24 rounded-tl-2xl border-l-4 border-t-4 border-[#23ce6b]" />
        <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-36 rounded-bl-2xl border-b-4 border-l-4 border-[#23ce6b]" />

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <RenduLogo size="lg" />
        </div>

        {/* Titulo aumentado y mas legible */}
        <div className="relative z-10 mx-auto max-w-xl text-center mb-8">
          <h1 className="text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">
            ¿Cómo prefieres que te contacten?
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-ink-600">
            Ingresa tu número de WhatsApp con código de país, enlace directo o correo preferido.
          </p>
        </div>

        {/* Input de contacto con icono animado */}
        <div className="relative z-10 mx-auto max-w-lg my-8">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4">
            {/* Tile dinámico rotativo */}
            <div 
              key={currentIndex} 
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${currentSocial.gradient} p-0.5 shadow-md transition-all duration-300`}
            >
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                {currentSocial.icon}
              </div>
            </div>

            {/* Input de contacto */}
            <div className="w-full flex-1">
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Ej. +57 300 123 4567 o wa.me/573001234567"
                className={`w-full rounded-2xl border bg-white px-5 py-3.5 text-base text-ink-900 shadow-xs placeholder:text-ink-400 focus:outline-none transition-colors ${
                  isOnlyGenericWord
                    ? "border-amber-400 focus:border-amber-500 ring-2 ring-amber-100"
                    : "border-surface-300 focus:border-[#23ce6b]"
                }`}
              />
            </div>
          </div>

          {/* Alerta si el usuario escribió solo "WhatsApp" */}
          {isOnlyGenericWord && (
            <div className="mt-3.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-center text-xs font-medium text-amber-900 animate-fadeIn">
              ⚠️ <strong>Detectamos que escribiste solo la palabra "{handle}".</strong><br />
              Por favor ingresa tu número con indicativo (ej. <strong>+57 300 123 4567</strong>) o tu enlace directo (ej. <strong>wa.me/573001234567</strong>) para que otros puedan comunicarse contigo.
            </div>
          )}

          {/* Atajos rapidos para formato */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-500">
            <span className="font-semibold text-ink-600">Sugerencias:</span>
            <button
              type="button"
              onClick={() => setHandle("+57 ")}
              className="rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1 text-ink-700 hover:bg-surface-100 hover:border-surface-300 transition-colors"
            >
              +57 (Colombia)
            </button>
            <button
              type="button"
              onClick={() => setHandle("https://wa.me/57")}
              className="rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1 text-ink-700 hover:bg-surface-100 hover:border-surface-300 transition-colors"
            >
              https://wa.me/57...
            </button>
          </div>
        </div>

        {/* Boton de continuar */}
        <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-100 pt-6">
          <button
            type="button"
            onClick={() => navigate("/catalog")}
            className="text-xs sm:text-sm font-semibold text-ink-400 hover:text-ink-700 transition-colors"
          >
            Configurar más tarde
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isOnlyGenericWord}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#23ce6b] px-8 py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Continuar al catálogo
            <img src={inlineSvg8} width={"18"} height={"18"} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
}