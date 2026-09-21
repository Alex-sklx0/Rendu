// Pagina para el registro de empresas

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RenduLogo } from "@/components/ui/RenduLogo";
import { registrarEmpresa, registrarUsuario } from "@/api/client";
import { MUNICIPIOS_VALLE_ABURRA } from "@/lib/constants";

export default function CompanyRegistrationPage() {
  const navigate = useNavigate();
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [nit, setNit] = useState("");
  const [municipio, setMunicipio] = useState("Medellín");
  const [tipoEmpresa, setTipoEmpresa] = useState("Generador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Envio del formulario de registro
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validacion de campos requeridos
    if (!email || !password || !nombreEmpresa || !nit || !municipio) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // 1. Crear el usuario en el sistema
      const user = await registrarUsuario({ email, password });
      
      // 2. Registrar los datos de la empresa vinculada
      const empresa = await registrarEmpresa({
        id_usuario: user.id,
        nombre: nombreEmpresa,
        nit,
        id_municipio: MUNICIPIOS_VALLE_ABURRA.indexOf(municipio) + 1,
        id_rol: tipoEmpresa === "Generador" ? 1 : 2,
      });

      // Guardar datos de sesion localmente
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify({
        id: user.id,
        email: user.email,
        nombre: empresa.nombre || nombreEmpresa,
        id_empresa: empresa.id,
      }));

      // Redirigir al modulo de comunicacion o catalogo
      navigate("/communication");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar la empresa.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-[#eef2f0] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm sm:p-10">
        
        {/* Logo principal */}
        <div className="flex justify-center mb-4">
          <RenduLogo size="lg" />
        </div>

        {/* Titulo y subtitulo */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-ink-900">
            Hablanos de tu empresa
          </h1>
          <p className="mt-1.5 text-xs text-ink-500">
            Solo necesitamos los datos básicos para comenzar.
          </p>
        </div>

        {/* Mensaje de error si falla el registro */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-center text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Formulario de registro */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nombre y NIT */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-800 mb-1" htmlFor="nombreEmpresa">
                Nombre de empresa
              </label>
              <input
                id="nombreEmpresa"
                type="text"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                placeholder="Ej. Fibretex"
                className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-xs text-ink-900 placeholder:text-ink-300 focus:border-[#23ce6b] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-800 mb-1" htmlFor="nit">
                Nit
              </label>
              <input
                id="nit"
                type="text"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                placeholder="Ej. 123456789 - 1"
                className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-xs text-ink-900 placeholder:text-ink-300 focus:border-[#23ce6b] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Municipio y Tipo de empresa */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-800 mb-1" htmlFor="municipio">
                Municipio
              </label>
              <div className="relative">
                <select
                  id="municipio"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 pr-8 text-xs text-ink-900 focus:border-[#23ce6b] focus:outline-none transition-colors"
                >
                  {MUNICIPIOS_VALLE_ABURRA.map((mun) => (
                    <option key={mun} value={mun}>
                      {mun}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-ink-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-800 mb-1" htmlFor="tipoEmpresa">
                Tipo de empresa
              </label>
              <div className="relative">
                <select
                  id="tipoEmpresa"
                  value={tipoEmpresa}
                  onChange={(e) => setTipoEmpresa(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 pr-8 text-xs text-ink-900 focus:border-[#23ce6b] focus:outline-none transition-colors"
                >
                  <option value="Generador">Generador</option>
                  <option value="Transformador">Transformador</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-ink-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Correo electronico */}
          <div>
            <label className="block text-xs font-bold text-ink-800 mb-1" htmlFor="email">
              Correo empresarial
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@empresa.com"
              className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-xs text-ink-900 placeholder:text-ink-300 focus:border-[#23ce6b] focus:outline-none transition-colors"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-bold text-ink-800 mb-1" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ej. Miclave123*"
              className="w-full rounded-xl border border-surface-200 px-3.5 py-2.5 text-xs text-ink-900 placeholder:text-ink-300 focus:border-[#23ce6b] focus:outline-none transition-colors"
            />
          </div>

          {/* Botones de accion */}
          <div className="space-y-2.5 pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#23ce6b] py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f] disabled:opacity-50"
            >
              {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
            </button>

            <Link
              to="/pre-register"
              className="flex w-full items-center justify-center rounded-xl bg-[#eef2f0] py-2.5 text-sm font-bold text-ink-700 transition-colors hover:bg-surface-200"
            >
              Volver
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
