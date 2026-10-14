// Pagina para elegir entre registrarse como persona o empresa

import { Link } from "react-router-dom";
import inlineSvg13 from "@/img/person.svg";
import inlineSvg14 from "@/img/company.svg";
import { RenduLogo } from "@/components/ui/RenduLogo";

export default function PreRegisterPage() {
  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-[#eef2f0] px-4 py-10">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl sm:p-14">
        {/* Decoracion verde de las esquinas estilo splash */}
        <div className="pointer-events-none absolute left-6 top-6 h-14 w-28 rounded-tl-2xl border-l-4 border-t-4 border-[#23ce6b]" />
        <div className="pointer-events-none absolute bottom-6 right-6 h-14 w-28 rounded-br-2xl border-b-4 border-r-4 border-[#23ce6b]" />

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <RenduLogo size="lg" />
        </div>

        {/* Titulo principal */}
        <div className="relative z-10 text-center mb-10">
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-4xl pb-4">
            Cuéntanos, ¿quién eres?
          </h1>
        
        </div>

        {/* Opciones de registro: persona o empresa en tarjetas amplias y claras */}
        <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-xl mx-auto">
          {/* Tarjeta de persona */}
          <Link
            to="/person-registration"
            className="group flex flex-col items-center justify-center rounded-3xl border-2 border-surface-200 bg-surface-50/60 p-8 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#23ce6b] hover:bg-white hover:shadow-lg"
          >
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-105 border border-surface-200">
              <img src={inlineSvg13} alt="" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink-900 group-hover:text-[#23ce6b] transition-colors">
              Persona Natural
            </h2>
          </Link>

          {/* Tarjeta de empresa */}
          <Link
            to="/company-registration"
            className="group flex flex-col items-center justify-center rounded-3xl border-2 border-surface-200 bg-surface-50/60 p-8 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#23ce6b] hover:bg-white hover:shadow-lg"
          >
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-105 border border-surface-200">
              <img src={inlineSvg14} alt="" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink-900 group-hover:text-[#23ce6b] transition-colors">
              Empresa
            </h2>
            
          </Link>
        </div>

        {/* Enlace para iniciar sesion */}
        <div className="relative z-10 mt-12 text-center pt-6">
          <span className="sm:text-[17px] font-semibold text-ink-700 mx-2">¿Ya tienes una cuenta registrada?</span>
          <Link
            to="/login"
            className="sm:text-[17px] text-[#23ce6b] font-bold underline hover:text-[#167a3f]"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
         
