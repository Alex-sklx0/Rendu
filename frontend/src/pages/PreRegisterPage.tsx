import { Link } from "react-router-dom";

export default function PreRegisterPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-[#eef2f0] px-4 py-8">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-8 shadow-sm sm:p-12">
        {/* ── Green Left & Bottom Corner Accent ────────────────────── */}
        <div className="pointer-events-none absolute bottom-6 left-6 h-28 w-40 rounded-bl-2xl border-b-4 border-l-4 border-[#23ce6b]" />
        <div className="pointer-events-none absolute left-6 top-8 h-8 w-4 rounded-tl-xl border-l-4 border-t-4 border-[#23ce6b]" />

        {/* ── Title ────────────────────────────────────────────────── */}
        <div className="relative z-10 text-center mb-10">
          <h1 className="text-xl font-extrabold text-ink-900 sm:text-2xl">
            Asi que... cuentanos, ¿Quién eres?
          </h1>
        </div>

        {/* ── Two Selection Tiles ──────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12">
          {/* Persona Card */}
          <Link
            to="/registro_persona"
            className="group flex flex-col items-center transition-transform duration-200 hover:scale-105"
          >
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-[#eef4f8] shadow-md transition-shadow group-hover:shadow-lg border border-[#e1e9ee]">
              {/* Single Person Icon */}
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="32" cy="22" r="9" stroke="#18322d" strokeWidth="3" />
                <path
                  d="M18 50C18 39 24 35 32 35C40 35 46 39 46 50"
                  stroke="#18322d"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="mt-3 text-base font-bold text-ink-900 group-hover:text-[#23ce6b] transition-colors">
              Persona
            </span>
          </Link>

          {/* Empresa Card */}
          <Link
            to="/registro_empresa"
            className="group flex flex-col items-center transition-transform duration-200 hover:scale-105"
          >
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-[#eef4f8] shadow-md transition-shadow group-hover:shadow-lg border border-[#e1e9ee]">
              {/* Team / Multiple People Icon */}
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Center person */}
                <circle cx="32" cy="22" r="7" stroke="#18322d" strokeWidth="2.5" />
                <path
                  d="M20 48C20 38 25 34 32 34C39 34 44 38 44 48"
                  stroke="#18322d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Left person */}
                <circle cx="20" cy="26" r="5" stroke="#18322d" strokeWidth="2.5" />
                <path
                  d="M11 48C11 41 15 38 19 37"
                  stroke="#18322d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Right person */}
                <circle cx="44" cy="26" r="5" stroke="#18322d" strokeWidth="2.5" />
                <path
                  d="M45 37C49 38 53 41 53 48"
                  stroke="#18322d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="mt-3 text-base font-bold text-ink-900 group-hover:text-[#23ce6b] transition-colors">
              Empresa
            </span>
          </Link>
        </div>

        {/* ── Footer Link ──────────────────────────────────────────── */}
        <div className="relative z-10 mt-12 text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-ink-400 hover:text-ink-700 transition-colors"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
