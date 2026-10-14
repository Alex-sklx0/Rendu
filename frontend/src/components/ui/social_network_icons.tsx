import instagramIcon from "@/img/social-instagram.svg";
import whatsappIcon from "@/img/social-whatsapp.svg";
import telegramIcon from "@/img/social-telegram.svg";
import emailIcon from "@/img/social-email.svg";

export const SocialNetworkIcons = [
  { name: "Instagram", gradient: "from-[#f9ed32] via-[#ee2a7b] to-[#002aff]", icon: <img src={instagramIcon} alt="" width={28} height={28} /> },
  { name: "WhatsApp", gradient: "from-[#25D366] to-[#128C7E]", icon: <img src={whatsappIcon} alt="" width={28} height={28} /> },
  { name: "Telegram", gradient: "from-[#229ED9] to-[#0088cc]", icon: <img src={telegramIcon} alt="" width={28} height={28} /> },
  { name: "Correo", gradient: "from-[#ea4335] to-[#fbbc05]", icon: <img src={emailIcon} alt="" width={28} height={28} /> },
];
