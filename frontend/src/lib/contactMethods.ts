import instagramIcon from "@/img/social-instagram.svg";
import whatsappIcon from "@/img/social-whatsapp.svg";
import emailIcon from "@/img/social-email.svg";
import phoneIcon from "@/img/social-phone.svg";

export type ContactMethodConfig = {
  id: string;
  name: string;
  gradient: string;
  icon: string;
  title: string;
  subtitle: string;
  placeholder: string;
  validate: (value: string) => { valid: boolean; error?: string };
};

const CONTACT_METHODS: Record<string, ContactMethodConfig> = {
  WhatsApp: {
    id: "WhatsApp",
    name: "WhatsApp",
    gradient: "from-[#25D366] to-[#128C7E]",
    icon: whatsappIcon,
    title: "Ingresa tu WhatsApp de contacto",
    subtitle: "Ingresa el número celular de tu empresa o el enlace directo hacia tu chat de WhatsApp.",
    placeholder: "Ej. +57 300 123 4567 o wa.me/573001234567",
    validate: (value) => {
      const trimmed = value.trim();
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
      if (/^\d{7,15}$/.test(trimmed.replace(/[\s()\-+]/g, ""))) return { valid: true };
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
    placeholder: "Ej. contacto@empresa.com",
    validate: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return { valid: false, error: "Por favor ingresa una dirección de correo electrónico." };
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
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
    placeholder: "Ej. @miempresa o https://instagram.com/miempresa",
    validate: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return { valid: false, error: "Por favor ingresa tu usuario o enlace de Instagram." };
      if (/^(instagram|insta|ig)$/i.test(trimmed)) {
        return {
          valid: false,
          error: "Escribiste solo la palabra 'Instagram'. Ingresa tu usuario (ej. @miempresa) o el enlace a tu perfil.",
        };
      }
      if (/^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}\/?$/i.test(trimmed)) return { valid: true };
      const handle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
      if (/^[a-zA-Z0-9._]{1,30}$/.test(handle) && !handle.includes("..")) return { valid: true };
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
    placeholder: "Ej. +57 604 123 4567 o 300 123 4567",
    validate: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return { valid: false, error: "Por favor ingresa un número de teléfono." };
      if (/^(telefono|celular|tel|llamada|movil)$/i.test(trimmed)) {
        return {
          valid: false,
          error: "Escribiste solo la palabra 'Teléfono'. Ingresa tu número telefónico (ej. +57 604 123 4567).",
        };
      }
      if (/^\d{7,15}$/.test(trimmed.replace(/[\s()\-+]/g, ""))) return { valid: true };
      return {
        valid: false,
        error: "Número no válido. Debe tener entre 7 y 15 dígitos numéricos (ej. +57 604 123 4567).",
      };
    },
  },
};

export function resolveContactMethod(rawMethod: string): ContactMethodConfig {
  const normalized = rawMethod.toLowerCase().trim();
  if (normalized.includes("whatsapp")) return CONTACT_METHODS.WhatsApp;
  if (normalized.includes("instagram")) return CONTACT_METHODS.Instagram;
  if (normalized.includes("correo") || normalized.includes("email") || normalized.includes("mail")) return CONTACT_METHODS.Correo;
  if (normalized.includes("tel") || normalized.includes("cel") || normalized.includes("llamada") || normalized.includes("movil")) {
    return CONTACT_METHODS.Telefono;
  }
  if (normalized.includes("telegram")) return CONTACT_METHODS.Telegram;

  return {
    id: rawMethod,
    name: rawMethod,
    gradient: "from-[#10b981] to-[#059669]",
    icon: emailIcon,
    title: `Ingresa tu contacto de ${rawMethod}`,
    subtitle: `Canal de comunicación oficial de tu empresa para ${rawMethod}.`,
    placeholder: `Ingresa tus datos de ${rawMethod}`,
    validate: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return { valid: false, error: `Por favor ingresa tu contacto de ${rawMethod}.` };
      if (trimmed.length < 3) return { valid: false, error: "El dato ingresado es demasiado corto." };
      return { valid: true };
    },
  };
}
