// Pantalla de presentacion 1

import { Link, useNavigate } from "react-router-dom";
import inlineSvg29 from "@/img/arrow-white.svg";
import circleBoxImg from "@/img/circle-box.svg";

export default function Splash1Page() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef2f0] px-4 py-8">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white p-12 shadow-xl sm:p-16 ">
        {/* Decoracion verde de la esquina */}
        <div className="pointer-events-none absolute left-6 top-6 h-14 w-28 rounded-tl-2xl border-l-4 border-t-4 border-[#23ce6b]" />

        <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-center">
          {/* Texto de presentacion */}
          <div className="flex-1 space-y-9">
            <h1 className="text-2xl font-extrabold text-ink-900 sm:text-4xl mt-4">
              Conecta tus subproductos a través de Rendu
            </h1>
            <p className="text-sm leading-relaxed text-ink-700 sm:text-[17px] pr-12">
              Esta plataforma te ayudará a encontrar nuevas relaciones con empresas y personas
              cercanas para que tus subproductos encuentren un nuevo valor...
            </p>
          </div>

          {/* Ilustracion */}
          <div className="flex h-44 w-44 flex-shrink-0 items-center justify-center">
            <img
              src={circleBoxImg}
              alt="Conecta tus subproductos"
              className="max-h-60 max-w-60 object-contain"
            />
          </div>
        </div>

        {/* Navegacion inferior */}
        <div className="mt-12 flex items-center justify-between">
          <Link
            to="/catalog"
            className="text-sm font-semibold text-ink-400 items-center gap-1.5 rounded-2xl px-4 py-2.5 hover:bg-[#c6d1cb] duration-200"
          >
            Saltar
          </Link>

          {/* Indicador de progreso */}
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full bg-[#23ce6b]" />
            <span className="h-2.5 w-2.5 rounded-full bg-surface-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-surface-200" />
          </div>

          <button
            type="button"
            onClick={() => navigate("/splash2")}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#23ce6b] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#167a3f] duration-300"
          >
            Siguiente
            <img src={inlineSvg29} width={"16"} height={"16"} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
}
