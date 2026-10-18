// Pagina para ingresar y validar el medio de contacto segun el canal seleccionado

import { useState, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { RenduLogo } from "@/components/ui/RenduLogo";
import { actualizarContactoEmpresa } from "@/api/client";
import instagramIcon from "@/img/social-instagram.svg";
import whatsappIcon from "@/img/social-whatsapp.svg";
import telegramIcon from "@/img/social-telegram.svg";
import emailIcon from "@/img/social-email.svg";
import phoneIcon from "@/img/social-phone.svg";
import inlineSvg8 from "@/img/arrow-white.svg";

interface MethodConfig {
  id: string;
  name: string;
  gradient: string;
  icon: string;
  title: string;
  subtitle: string;
  inputLabel: string;
  placeholder: string;
  helperText: string;
  chips: { label: string; value: string }[];
  validate: (val: string) => { valid: boolean; error?: string };
}

const KNOWN_CONFIGS: Record<string, MethodConfig> = {
  WhatsApp: {
    id: "WhatsApp",
    name: "WhatsApp",
    gradient: "from-[#25D366] to-[#128C7E]",
    icon: whatsappIcon,
    title: "Ingresa tu WhatsApp de contacto",
    subtitle: "Ingresa el número celular de tu empresa o el enlace directo hacia tu chat de WhatsApp.",
    inputLabel: "Número o enlace de WhatsApp *",
    placeholder: "Ej. +57 300 123 4567 o wa.me/573001234567",
    helperText: "Puedes escribir tu número con o sin indicativo (+57), o un enlace corto wa.me/...",
    chips: [
      { label: "+57 (Colombia)", value: "+57 " },
      { label: "wa.me/57...", value: "https://wa.me/57" },
    ],
    validate: (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return { valid: false, error: "Por favor ingresa tu número o enlace de WhatsApp." };
      if (/^(whatsapp|wasap|wpp|whastapp|watsapp|celular|telefono)$/i.test(trimmed)) {
        return {
          valid: false,
          error: "Escribiste solo la palabra 'WhatsApp'. Ingresa tu número telefónico (ej. +57 300 123 4567) o enlace directo.",
        };
      }
      if (/^(https?:\/\/)?(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)/i.test(trimmed)) {
        return { valid: true };
      }
      const digitsOnly = trimmed.replace(/[\s\-\(\)\+]/g, "");
      if (/^\d{7,15}$/.test(digitsOnly)) {
        return { valid: true };
      }
      return {
        valid: false,
        error: "Formato no válido. Debe ser un número telefónico (ej. +57 300 123 4567) o un enlace wa.me/...",
      };
    },
  },

  Correo: {
    id: "Correo",
    name: "Correo electrónico",
    gradient: "from-[#ea4335] to-[#fbbc05]",
    icon: emailIcon,
    title: "Ingresa tu correo corporativo",
    subtitle: "Dirección oficial donde las empresas interesadas te enviarán solicitudes de subproductos.",
    inputLabel: "Correo electrónico empresarial *",
    placeholder: "Ej. contacto@empresa.com",
    helperText: "Asegúrate de ingresar un correo electrónico activo con formato usuario@dominio.com",
    chips: [
      { label: "@gmail.com", value: "@gmail.com" },
      { label: "@empresa.com", value: "@empresa.com" },
    ],
    validate: (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return { valid: false, error: "Por favor ingresa una dirección de correo electrónico." };
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmed)) {
        return {
          valid: false,
          error: "Formato de correo no válido. Debe ser una dirección completa como contacto@empresa.com.",
        };
      }
      return { valid: true };
    },
  },

  Instagram: {
    id: "Instagram",
    name: "Instagram",
    gradient: "from-[#f9ed32] via-[#ee2a7b] to-[#002aff]",
    icon: instagramIcon,
    title: "Ingresa tu perfil de Instagram",
    subtitle: "Ingresa el nombre de usuario (@usuario) o el enlace completo hacia la cuenta de tu empresa.",
    inputLabel: "Usuario o enlace de Instagram *",
    placeholder: "Ej. @miempresa o https://instagram.com/miempresa",
    helperText: "Puedes escribir el usuario con '@' o pegar el enlace completo de tu perfil de Instagram.",
    chips: [
      { label: "@ (añadir arroba)", value: "@" },
      { label: "https://instagram.com/", value: "https://instagram.com/" },
    ],
    validate: (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return { valid: false, error: "Por favor ingresa tu usuario o enlace de Instagram." };
      if (/^(instagram|insta|ig)$/i.test(trimmed)) {
        return {
          valid: false,
          error: "Escribiste solo la palabra 'Instagram'. Ingresa tu usuario (ej. @miempresa) o el enlace a tu perfil.",
        };
      }
      if (/^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}\/?$/i.test(trimmed)) {
        return { valid: true };
      }
      const handle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
      if (/^[a-zA-Z0-9._]{1,30}$/.test(handle) && !handle.includes("..")) {
        return { valid: true };
      }
      return {
        valid: false,
        error: "Usuario de Instagram no válido. Debe tener entre 1 y 30 caracteres (letras, números, puntos o guiones bajos).",
      };
    },
  },

  Telefono: {
    id: "Teléfono",
    name: "Teléfono",
    gradient: "from-[#3b82f6] to-[#1d4ed8]",
    icon: phoneIcon,
    title: "Ingresa tu teléfono corporativo",
    subtitle: "Número de teléfono fijo o móvil donde tus aliados comerciales podrán contactar a tu empresa.",
    inputLabel: "Número telefónico *",
    placeholder: "Ej. +57 604 123 4567 o 300 123 4567",
    helperText: "Ingresa tu número telefónico con o sin indicativo (+57).",
    chips: [
      { label: "+57 (Colombia)", value: "+57 " },
      { label: "604 (Medellín)", value: "+57 604 " },
      { label: "+57 3...", value: "+57 3" },
    ],
    validate: (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return { valid: false, error: "Por favor ingresa un número de teléfono." };
      if (/^(telefono|celular|tel|llamada|movil)$/i.test(trimmed)) {
        return {
          valid: false,
          error: "Escribiste solo la palabra 'Teléfono'. Ingresa tu número telefónico (ej. +57 604 123 4567).",
        };
      }
      const digitsOnly = trimmed.replace(/[\s\-\(\)\+]/g, "");
      if (/^\d{7,15}$/.test(digitsOnly)) {
        return { valid: true };
      }
      return {
        valid: false,
        error: "Número no válido. Debe tener entre 7 y 15 dígitos numéricos (ej. +57 604 123 4567).",
      };
    },
  },

  Telegram: {
    id: "Telegram",
    name: "Telegram",
    gradient: "from-[#229ED9] to-[#0088cc]",
    icon: telegramIcon,
    title: "Ingresa tu contacto de Telegram",
    subtitle: "Ingresa tu nombre de usuario (@usuario), enlace t.me o número celular asociado.",
    inputLabel: "Usuario, enlace o número de Telegram *",
    placeholder: "Ej. @miempresa o https://t.me/miempresa",
    helperText: "Puedes ingresar tu nombre de usuario (@usuario), enlace directo t.me/... o número con indicativo.",
    chips: [
      { label: "@ (añadir arroba)", value: "@" },
      { label: "https://t.me/", value: "https://t.me/" },
      { label: "+57 (Colombia)", value: "+57 " },
    ],
    validate: (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return { valid: false, error: "Por favor ingresa tu usuario o enlace de Telegram." };
      if (/^(telegram|tg)$/i.test(trimmed)) {
        return {
          valid: false,
          error: "Escribiste solo la palabra 'Telegram'. Ingresa tu usuario (@usuario) o enlace t.me/...",
        };
      }
      if (/^(https?:\/\/)?(t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,32}\/?$/i.test(trimmed)) {
        return { valid: true };
      }
      const digitsOnly = trimmed.replace(/[\s\-\(\)\+]/g, "");
      if (/^\d{7,15}$/.test(digitsOnly)) {
        return { valid: true };
      }
      const handle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
      if (/^[a-zA-Z0-9_]{5,32}$/.test(handle)) {
        return { valid: true };
      }
      return {
        valid: false,
        error: "Formato de Telegram no válido. Debe tener mínimo 5 caracteres (letras, números o guiones bajos) o ser un número válido.",
      };
    },
  },
};

// Resuelve la configuracion y validacion dinamicamente segun el nombre consultado
function resolveConfig(rawMethod: string): MethodConfig {
  const norm = rawMethod.toLowerCase().trim();

  if (norm.includes("whatsapp")) return KNOWN_CONFIGS.WhatsApp;
  if (norm.includes("instagram")) return KNOWN_CONFIGS.Instagram;
  if (norm.includes("correo") || norm.includes("email") || norm.includes("mail")) return KNOWN_CONFIGS.Correo;
  if (norm.includes("tel") || norm.includes("cel") || norm.includes("llamada") || norm.includes("movil")) return KNOWN_CONFIGS.Telefono;
  if (norm.includes("telegram")) return KNOWN_CONFIGS.Telegram;

  // Fallback dinamico para cualquier medio nuevo proveniente de la base de datos
  return {
    id: rawMethod,
    name: rawMethod,
    gradient: "from-[#10b981] to-[#059669]",
    icon: emailIcon,
    title: `Ingresa tu contacto de ${rawMethod}`,
    subtitle: `Canal de comunicación oficial de tu empresa para ${rawMethod}.`,
    inputLabel: `Contacto de ${rawMethod} *`,
    placeholder: `Ingresa tus datos de ${rawMethod}`,
    helperText: `Asegúrate de ingresar información de contacto válida.`,
    chips: [],
    validate: (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return { valid: false, error: `Por favor ingresa tu contacto de ${rawMethod}.` };
      if (trimmed.length < 3) return { valid: false, error: "El dato ingresado es demasiado corto." };
      return { valid: true };
    },
  };
}

export default function CommunicationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar el medio de contacto elegido desde la URL, state o localStorage
  const currentMethodName: string = useMemo(() => {
    const fromSearch = new URLSearchParams(location.search).get("method");
    const fromState = (location.state as { method?: string } | null)?.method;
    const fromStorage = localStorage.getItem("selected_contact_method");

    return fromSearch || fromState || fromStorage || "WhatsApp";
  }, [location.search, location.state]);

  // Leer el id real del medio desde el state de navegacion o desde localStorage
  const currentMedioId: number = useMemo(() => {
    const fromState = (location.state as { id_medio?: number } | null)?.id_medio;
    const fromStorage = localStorage.getItem("selected_contact_method_id");
    return fromState ?? (fromStorage ? Number(fromStorage) : 1);
  }, [location.state]);

  const config = useMemo(() => resolveConfig(currentMethodName), [currentMethodName]);

  const [handle, setHandle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleInputChange(val: string) {
    setHandle(val);
    if (errorMessage) {
      setErrorMessage(null);
    }
  }

  function handleAddChip(chipValue: string) {
    if (chipValue.startsWith("@") && chipValue === "@") {
      setHandle((prev) => (prev.startsWith("@") ? prev : `@${prev}`));
    } else if (chipValue.startsWith("@")) {
      setHandle((prev) => (prev.includes("@") ? prev : `${prev}${chipValue}`));
    } else {
      setHandle(chipValue);
    }
    setErrorMessage(null);
  }

  async function handleContinue() {
    const validation = config.validate(handle);
    if (!validation.valid) {
      setErrorMessage(validation.error || "El formato ingresado no es válido.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const contactoLimpio = handle.trim();

    try {
      // 1. Guardar en el backend si el usuario tiene empresa asociada
      const storedUser = localStorage.getItem("user");
      let currentUser = storedUser ? JSON.parse(storedUser) : null;

      if (currentUser?.id_empresa) {
        await actualizarContactoEmpresa(currentUser.id_empresa, {
          id_medio_contacto: currentMedioId,
          contacto: contactoLimpio,
        });
      }

      // 2. Guardar en el usuario local
      if (currentUser) {
        currentUser.medio_contacto = config.id;
        currentUser.contacto = contactoLimpio;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }

      // 3. Continuar al catálogo
      navigate("/catalog");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al guardar el medio de contacto.";
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
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

       

        {/* Titulo y descripcion contextual segun el medio */}
        <div className="relative z-10 mx-auto max-w-xl text-center mb-8">
          <h1 className="text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">
            {config.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-ink-600">
            {config.subtitle}
          </p>
        </div>

        {/* Mensaje de error de validacion */}
        {errorMessage && (
          <div className="relative z-10 mx-auto max-w-lg mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Input de contacto con el icono del canal correspondiente */}
        <div className="relative z-10 mx-auto max-w-lg my-8">
          <label htmlFor="contacto-input" className="block text-xs sm:text-sm font-bold text-ink-800 mb-2">
            {config.inputLabel}
          </label>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4">
            {/* Tile con el icono del canal */}
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${config.gradient} p-0.5 shadow-md`}
            >
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                <img src={config.icon} alt={config.name} width={30} height={30} />
              </div>
            </div>

            {/* Input de texto con validacion */}
            <div className="w-full flex-1">
              <input
                id="contacto-input"
                type="text"
                value={handle}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={config.placeholder}
                className={`w-full rounded-2xl border bg-white px-5 py-3.5 text-base text-ink-900 shadow-xs placeholder:text-ink-300 focus:outline-none transition-colors ${
                  errorMessage
                    ? "border-red-400 focus:border-red-500 ring-2 ring-red-100"
                    : "border-surface-300 focus:border-[#23ce6b]"
                }`}
              />
            </div>
          </div>

          <p className="mt-2 text-xs text-ink-500">
            {config.helperText}
          </p>

          {/* Atajos rapidos de formato */}
          {config.chips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-500">
              <span className="font-semibold text-ink-600">Sugerencias rápidas:</span>
              {config.chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleAddChip(chip.value)}
                  className="rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1 text-ink-700 hover:bg-surface-100 hover:border-surface-300 transition-colors cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botones de accion */}
        <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-100 pt-6">
          <Link
            to="/communication-method"
            className="inline-flex items-center gap-2 rounded-full bg-surface-100 px-3.5 py-1.5 text-xs font-bold text-ink-700 hover:bg-surface-200 border border-surface-300 transition-colors"
          >
            Volver atrás
          </Link>

          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#23ce6b] px-8 py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Guardando..." : "Guardar y continuar"}
            <img src={inlineSvg8} width={"18"} height={"18"} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
}