// Pagina para el registro de empresas

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RenduLogo } from "@/components/ui/RenduLogo";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { registrarEmpresa, registrarUsuario } from "@/api/client";
import { MUNICIPIOS_VALLE_ABURRA } from "@/lib/constants";
import { Select } from "@/components/ui/Select";

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

  // Formateador de NIT: añade guion automatico tras el 9no digito y limita a 10 digitos totales
  function handleNitChange(val: string) {
    const raw = val.replace(/[^\d]/g, "").slice(0, 10);
    if (raw.length > 9) {
      setNit(`${raw.slice(0, 9)}-${raw.slice(9, 10)}`);
    } else {
      setNit(raw);
    }
  }

  // Envio del formulario de registro
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validacion de campos requeridos
    if (!email || !password || !nombreEmpresa || !nit || !municipio) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
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
        tipo: tipoEmpresa,
        municipio,
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
    <div className="flex min-h-[90vh] items-center justify-center bg-[#eef2f0] px-4 py-10">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl sm:p-12">
        {/* Decoracion verde de la esquina estilo splash */}
        <div className="pointer-events-none absolute left-6 top-6 h-12 w-24 rounded-tl-2xl border-l-4 border-t-4 border-[#23ce6b]" />
        
        {/* Logo principal */}
        <div className="flex justify-center mb-5">
          <RenduLogo size="lg" />
        </div>

        {/* Titulo y subtitulo aumentados de tamaño */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
            Háblanos de tu empresa
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">
            Solo necesitamos los datos básicos para conectar tus subproductos.
          </p>
        </div>

        {/* Mensaje de error si falla el registro */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-center text-sm font-semibold text-red-700 border border-red-200">
            {error}
          </div>
        )}
Faltan 
        {/* Formulario de registro */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Nombre y NIT */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[17px] font-bold text-ink-800 mb-1.5" htmlFor="nombreEmpresa">
                Nombre de empresa
              </label>
              <input
                id="nombreEmpresa"
                type="text"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                placeholder="Ej. Fibretex S.A.S."
                required
                className="w-full rounded-2xl border border-surface-400 px-4 py-3 text-sm font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 transition-colors hover:border-surface-400 focus:border-[#23ce6b] focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[17px] font-bold text-ink-800" htmlFor="nit">
                  NIT con dígito de verificación
                </label>
              </div>
              <input
                id="nit"
                type="text"
                value={nit}
                onChange={(e) => handleNitChange(e.target.value)}
                placeholder="Ej. 900123456-1"
                maxLength={11}
                required
                className="w-full rounded-2xl border border-surface-400 px-4 py-3 text-sm font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 transition-colors hover:border-surface-400 focus:border-[#23ce6b] focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Municipio y Tipo de empresa */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[17px] font-bold text-ink-800 mb-1.5" htmlFor="municipio">
                Municipio
              </label>
              <Select id="municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)}>
                {MUNICIPIOS_VALLE_ABURRA.map((mun) => <option key={mun} value={mun}>{mun}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-[17px] font-bold text-ink-800 mb-1.5" htmlFor="tipoEmpresa">
                Tipo de empresa
              </label>
              <Select id="tipoEmpresa" value={tipoEmpresa} onChange={(e) => setTipoEmpresa(e.target.value)}>
                <option value="Generador">Generador (Produce subproductos)</option>
                <option value="Transformador">Transformador (Aprovecha materiales)</option>
              </Select>
            </div>
          </div>

          {/* Correo electronico */}
          <div>
            <label className="block text-[17px] font-bold text-ink-800 mb-1.5" htmlFor="email">
              Correo empresarial
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@empresa.com"
              required
              className="w-full rounded-2xl border border-surface-400 px-4 py-3 text-sm font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 transition-colors hover:border-surface-400 focus:border-[#23ce6b] focus:outline-none"
            />
          </div>

          {/* Contraseña con validador visible y boton mostrar/ocultar */}
          <div>
            <label className="block text-[17px] font-bold text-ink-800 mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa una contraseña segura"
              className="border-surface-400"
              showRules={true}
              required
            />
          </div>

          {/* Botones de accion */}
          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-[#23ce6b] py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Creando cuenta de empresa…" : "Crear cuenta"}
            </button>

            <Link
              to="/pre-register"
              className="flex w-full items-center justify-center rounded-2xl bg-surface-100 py-3 text-sm font-bold text-ink-700 transition-colors hover:bg-surface-200"
            >
              ← Volver
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
