import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import iconImg from "@/img/icon.png";

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecciona automáticamente a splash1 después de 3 segundos
    const timer = setTimeout(() => {
      navigate("/splash1");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#eef2f0] px-4 select-none">
      {/* ── Centered Logo ─────────────────────────────────────────── */}
      <Link
        to="/splash1"
        className="group flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105"
      >
        <img
          src={iconImg}
          alt="Rendu"
          className="h-32 w-32 object-contain sm:h-40 sm:w-40 drop-shadow-sm"
        />
        <span className="mt-4 text-3xl font-extrabold tracking-tight text-[#23ce6b] sm:text-4xl">
          Rendu
        </span>
      </Link>

      {/* Subtle indicator showing 3s timer */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="h-1 w-24 overflow-hidden rounded-full bg-surface-200">
          <div className="h-full w-full origin-left animate-[pulse_3s_ease-in-out] bg-[#23ce6b]" />
        </div>
        <Link
          to="/splash1"
          className="text-xs font-semibold text-ink-400 hover:text-ink-700 transition-colors"
        >
          Toca para continuar
        </Link>
      </div>
    </div>
  );
}
