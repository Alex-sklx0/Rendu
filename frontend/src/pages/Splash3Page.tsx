// Pantalla de presentacion 3

import { Link, useNavigate } from "react-router-dom";
import inlineSvg31 from "@/img/arrow-white.svg";
import certificateImg from "@/img/certificate.svg";

export default function Splash3Page() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef2f0] px-4 py-8">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white p-12 shadow-xl sm:p-16">
        {/* Decoracion verde de la esquina */}
        <div className="pointer-events-none absolute bottom-6 right-6 h-14 w-28 rounded-br-2xl border-b-4 border-r-4 border-[#23ce6b]" />

        <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-center">
          {/* Texto de presentacion */}
          <div className="flex-1 space-y-9">
            <h1 className="mt-4 text-2xl font-extrabold text-ink-900 sm:text-4xl">
              Certificate y sientete seguro con nosotros
            </h1>
            <p className="pr-12 text-sm leading-relaxed text-ink-700 sm:text-[17px]">
              Genera certificados por tus ventas o compras concretadas y sientete seguro
              de apoyar nuestra economia circular...
            </p>
          </div>

          {/* Ilustracion */}
          <div className="flex h-44 w-44 flex-shrink-0 items-center justify-center">
            <img
              src={certificateImg}
              alt="Certificación y seguridad"
              className="max-h-60 max-w-60 object-contain"
            />
          </div>
        </div>

        {/* Navegacion inferior */}
        <div className="mt-12 flex items-center justify-between">
          <Link
            to="/splash2"
            className="flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink-400 duration-300 hover:bg-[#c6d1cb]"
          >
            ← Anterior
          </Link>

          {/* Indicador de progreso */}
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-surface-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-surface-200" />
            <span className="h-2.5 w-6 rounded-full bg-[#23ce6b]" />
          </div>

          {/* Siguiente paso según el flujo solicitado: Catálogo */}
          <button
            type="button"
            onClick={() => navigate("/catalog")}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#23ce6b] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#167a3f]"
          >
            Siguiente
            <img src={inlineSvg31} width={"16"} height={"16"} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
}
