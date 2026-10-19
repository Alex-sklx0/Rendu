// Pagina para que las empresas elijan su medio de contacto preferido desde la base de datos
// Usa el Carousel con física de spring para mostrar los medios dinámicamente

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RenduLogo } from "@/components/ui/RenduLogo";
import Carousel from "@/components/ui/Carousel";
import { getMediosContacto } from "@/api/client";
import type { MedioContacto } from "@/types";
import instagramIcon from "@/img/social-instagram.svg";
import whatsappIcon from "@/img/social-whatsapp.svg";
import telegramIcon from "@/img/social-telegram.svg";
import emailIcon from "@/img/social-email.svg";
import phoneIcon from "@/img/social-phone.svg";

// Paletas e iconos según el nombre del medio que retorne la BD
interface MethodVisuals {
  gradient: string;
  icon: string;
  accentColor: string;
}

function resolveMethodVisuals(nombre: string): MethodVisuals {
  const norm = nombre.toLowerCase().trim();

  if (norm.includes("whatsapp")) {
    return {
      gradient: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
      icon: whatsappIcon,
      accentColor: "#25D366",
    };
  }
  if (norm.includes("instagram")) {
    return {
      gradient: "linear-gradient(135deg, #f9ed32 0%, #ee2a7b 50%, #002aff 100%)",
      icon: instagramIcon,
      accentColor: "#ee2a7b",
    };
  }
  if (norm.includes("correo") || norm.includes("email") || norm.includes("mail")) {
    return {
      gradient: "linear-gradient(135deg, #ea4335 0%, #fbbc05 100%)",
      icon: emailIcon,
      accentColor: "#ea4335",
    };
  }
  if (norm.includes("tel") || norm.includes("cel") || norm.includes("llamada") || norm.includes("movil")) {
    return {
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      icon: phoneIcon,
      accentColor: "#3b82f6",
    };
  }
  if (norm.includes("telegram")) {
    return {
      gradient: "linear-gradient(135deg, #229ED9 0%, #0088cc 100%)",
      icon: telegramIcon,
      accentColor: "#229ED9",
    };
  }
  return {
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    icon: emailIcon,
    accentColor: "#10b981",
  };
}

// Tarjeta personalizada para cada medio de contacto dentro del Carousel
function MethodCard({ method, visuals, onClick }: { method: MedioContacto; visuals: MethodVisuals; onClick: () => void }) {
  const normalizedName = method.nombre.charAt(0).toUpperCase() + method.nombre.slice(1).toLowerCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className="h-full w-full cursor-pointer select-none rounded-3xl text-center shadow-lg focus:outline-none"
      style={{ padding: "calc(24px * var(--carousel-scale, 1))" }}
    >
      {/* Ícono con gradiente */}
      <div className="flex items-center justify-center flex-1">
        <div
          className="flex items-center justify-center rounded-[28px] shadow-xl"
          style={{
            background: visuals.gradient,
            padding: 3,
            width: "calc(100px * var(--carousel-scale, 1))",
            height: "calc(100px * var(--carousel-scale, 1))",
          }}
        >
          <div
            className="flex w-full h-full items-center justify-center rounded-[26px] bg-white"
          >
            <img
              src={visuals.icon}
              alt={normalizedName}
              style={{ width: "calc(52px * var(--carousel-scale, 1))", height: "calc(52px * var(--carousel-scale, 1))" }}
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Nombre */}
      <div style={{ opacity: "var(--carousel-focus, 1)" }}>
        <p
          className="font-extrabold leading-tight mt-3"
          style={{
            fontSize: "calc(20px * var(--carousel-scale, 1))",
            color: "var(--carousel-ink)",
          }}
        >
          {normalizedName}
        </p>
      </div>

      {/* Hint de acción */}
      <p
        className="text-[10px] font-bold uppercase tracking-widest mt-5"
        style={{ color: visuals.accentColor, opacity: "var(--carousel-focus, 1)" }}
      >
        Toca para elegir →
      </p>
    </button>
  );
}

export default function CommunicationMethodPage() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState<MedioContacto[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const activeIndexRef = useRef(0);

  // Mantener ref sincronizada con el estado (para el botón de Continuar)
  activeIndexRef.current = activeIndex;

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

  function navigate_to_method(method: MedioContacto) {
    localStorage.setItem("selected_contact_method", method.nombre);
    localStorage.setItem("selected_contact_method_id", String(method.id));
    navigate(`/communication?method=${encodeURIComponent(method.nombre)}`, {
      state: { method: method.nombre, id_medio: method.id },
    });
  }

  function handleContinue() {
    const method = methods[activeIndexRef.current];
    if (method) navigate_to_method(method);
  }

  // Construir los items del carousel como elementos React personalizados
  const carouselItems = methods.map((method) => {
    const visuals = resolveMethodVisuals(method.nombre);
    return (
      <MethodCard
        key={method.id}
        method={method}
        visuals={visuals}
        onClick={() => navigate_to_method(method)}
      />
    );
  });

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-[#eef2f0] px-4 py-10">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl sm:p-14 overflow-hidden">
        {/* Decoraciones en las esquinas estilo splash */}
        <div className="pointer-events-none absolute left-6 top-6 h-12 w-24 rounded-tl-2xl border-l-4 border-t-4 border-[#23ce6b]" />
        <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-36 rounded-bl-2xl border-b-4 border-l-4 border-[#23ce6b]" />

        {/* Logo */}
        <div className="relative z-10 flex justify-center mb-6">
          <RenduLogo size="lg" />
        </div>

        {/* Título */}
        <div className="relative z-10 mx-auto max-w-xl text-center mb-10">
          <h1 className="text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">
            ¿Por cuál medio prefieres que te contacten?
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-ink-600">
            Escoge uno de los canales disponibles.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative z-10 flex justify-center">
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
            <Carousel
              items={carouselItems}
              baseWidth={380}
              aspectRatio={1.7}
              gap={18}
              radius={24}
              frame={false}
              effect="tilt"
              indicator="dots"
              arrows
              loop
              theme="light"
              className="contact-method-carousel"
              onChange={(index) => setActiveIndex(index)}
            />
          )}
        </div>

        {/* Acciones inferiores */}
        <div className="relative z-10 mt-10 flex justify-end pt-2">
          <button
            type="button"
            onClick={handleContinue}
            disabled={loading || methods.length === 0}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#23ce6b] px-8 py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f] disabled:opacity-50 cursor-pointer"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
