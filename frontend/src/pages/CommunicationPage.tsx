import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CommunicationPage() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState("");

  function handleContinue() {
    navigate("/catalog");
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-[#eef2f0] px-4 py-8">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-sm sm:p-12">
        {/* ── Green Bottom-Left Corner Accent ──────────────────────── */}
        <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-36 rounded-bl-2xl border-b-4 border-l-4 border-[#23ce6b]" />

        {/* ── Title ────────────────────────────────────────────────── */}
        <div className="relative z-10 mx-auto max-w-lg text-center mb-10">
          <h1 className="text-lg font-extrabold leading-snug text-ink-900 sm:text-2xl">
            Para comunicarte con otros danos el link, número o describe tu medio de comunicación preferido...
          </h1>
        </div>

        {/* ── Center Communication Tile & Input ────────────────────── */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5 my-8">
          {/* Instagram / App Icon Tile */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f9ed32] via-[#ee2a7b] to-[#002aff] p-0.5 shadow-md">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
              {/* Instagram Icon */}
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
            </div>
          </div>

          {/* Pill Input */}
          <div className="w-full max-w-sm">
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="ig.@miusuario/..."
              className="w-full rounded-full border border-surface-300 bg-white px-5 py-3 text-sm text-ink-900 shadow-inner placeholder:text-ink-400 focus:border-[#23ce6b] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* ── Continue Button (Bottom Right) ───────────────────────── */}
        <div className="relative z-10 mt-12 flex justify-end">
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-2 rounded-xl bg-[#23ce6b] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f]"
          >
            Continuar
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
