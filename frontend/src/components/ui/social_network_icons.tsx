export const SocialNetworkIcons = [
  {
    name: "Instagram",
    gradient: "from-[#f9ed32] via-[#ee2a7b] to-[#002aff]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)" strokeWidth="2.2" />
        <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="2.2" />
        <circle cx="18" cy="6" r="1.2" fill="#ee2a7b" />
        <defs>
          <linearGradient id="ig-grad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f9ed32" />
            <stop offset="0.5" stopColor="#ee2a7b" />
            <stop offset="1" stopColor="#002aff" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    gradient: "from-[#25D366] to-[#128C7E]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    gradient: "from-[#229ED9] to-[#0088cc]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#229ED9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
  },
  {
    name: "Correo",
    gradient: "from-[#ea4335] to-[#fbbc05]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];