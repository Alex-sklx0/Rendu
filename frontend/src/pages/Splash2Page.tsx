import { Link, useNavigate } from "react-router-dom";
import shipperImg from "@/img/shipper.png";

export default function Splash2Page() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef2f0] px-4 py-8">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-lg sm:p-12">
        {/* ── Green Bottom-Left Corner Accent ──────────────────────── */}
        <div className="pointer-events-none absolute bottom-6 left-6 h-14 w-28 rounded-bl-xl border-b-4 border-l-4 border-[#23ce6b]" />

        <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-center">
          {/* Left Text */}
          <div className="flex-1 space-y-4">
            <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
              Mejoremos juntos la eficiencia del transporte
            </h1>
            <p className="text-sm leading-relaxed text-ink-500 sm:text-base">
              Ponte de acuerdo con otros para gestionar mejor el transporte de tus
              subproductos...
            </p>
          </div>

          {/* Right Illustration: shipper.png */}
          <div className="flex h-44 w-44 flex-shrink-0 items-center justify-center">
            <img
              src={shipperImg}
              alt="Eficiencia del transporte"
              className="max-h-40 max-w-40 object-contain"
            />
          </div>
        </div>

        {/* ── Footer / Navigation ──────────────────────────────────── */}
        <div className="mt-10 flex items-center justify-between pt-6">
          <Link
            to="/splash1"
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-ink-800"
          >
            ← Anterior
          </Link>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-surface-200" />
            <span className="h-2.5 w-6 rounded-full bg-[#23ce6b]" />
            <span className="h-2.5 w-2.5 rounded-full bg-surface-200" />
          </div>

          <button
            type="button"
            onClick={() => navigate("/splash3")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#23ce6b] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f]"
          >
            Siguiente
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
