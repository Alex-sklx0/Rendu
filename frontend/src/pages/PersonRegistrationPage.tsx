// Pagina para el registro de personas naturales o recicladores

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RenduLogo } from "@/components/ui/RenduLogo";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { registrarUsuario, registrarPersona } from "@/api/client";
import { MUNICIPIOS_VALLE_ABURRA } from "@/lib/constants";
import { Select } from "@/components/ui/Select";

export default function PersonRegistrationPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [municipio, setMunicipio] = useState("Medellín");
  const [tipoActividad, setTipoActividad] = useState("Reciclador");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formateador de cedula: solo digitos y limite de 10 caracteres
  function handleCedulaChange(val: string) {
    const raw = val.replace(/[^\d]/g, "").slice(0, 10);
    setCedula(raw);
  }

  // Envio del formulario de registro
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validacion de campos requeridos
    if (!email || !password || !cedula.trim()) {
      setError("Por favor completa correo, contraseña y cédula.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const nombreFinal = nombre.trim() || email.split("@")[0];
      
      // 1. Registrar cuenta de usuario
      const user = await registrarUsuario({ email, password });

      // 2. Registrar perfil de persona natural
      await registrarPersona({
        id_usuario: user.id,
        nombre: nombreFinal,
        cedula: cedula.trim(),
        id_municipio: MUNICIPIOS_VALLE_ABURRA.indexOf(municipio) + 1,
        id_rol: tipoActividad === "Reciclador" ? 3 : 2,
      });

      // Guardar sesion localmente
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify({
        id: user.id,
        email: user.email,
        nombre: nombreFinal,
        id_empresa: null,
        tipo: tipoActividad,
        municipio,
      }));

      // Redirigir al usuario
      navigate("/communication");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar la persona.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-[#eef2f0] px-4 py-10">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl sm:p-12">
        {/* Decoracion verde de la esquina estilo splash */}
        <div className="pointer-events-none absolute left-6 top-6 h-12 w-24 rounded-tl-2xl border-l-4 border-t-4 border-[#23ce6b]" />
        
        {/* Logo principal */}
        <div className="flex justify-center mb-5">
          <RenduLogo size="lg" />
        </div>

        {/* Titulo y subtitulo aumentados de tamaño */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
            Háblanos de tu persona
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-base">
            Solo necesitamos los datos básicos para que explores y transformes materiales.
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-center text-sm font-semibold text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Formulario de registro */}
        <form onSubmit={handleSubmit} className="space-y-5 ">
          
          {/* Nombre y Cedula con limite */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[17px] font-bold text-ink-800 mb-1.5" htmlFor="nombre">
                Nombre completo
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full rounded-2xl border border-surface-400 px-4 py-3 text-sm font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 transition-colors hover:border-surface-400 focus:border-[#23ce6b] focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[17px] font-bold text-ink-800" htmlFor="cedula">
                  Cédula de ciudadanía 
                </label>
              </div>
              <input
                id="cedula"
                type="text"
                value={cedula}
                onChange={(e) => handleCedulaChange(e.target.value)}
                placeholder="Ej. 1020304050"
                maxLength={10}
                required
                className="w-full rounded-2xl border border-surface-400 px-4 py-3 text-sm font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 transition-colors hover:border-surface-400 focus:border-[#23ce6b] focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Municipio y Tipo de actividad */}
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
              <label className="block text-[17px] font-bold text-ink-800 mb-1.5" htmlFor="tipoActividad">
                Tipo de actividad 
              </label>
              <Select id="tipoActividad" value={tipoActividad} onChange={(e) => setTipoActividad(e.target.value)}>
                <option value="Reciclador">Reciclador</option>
                <option value="Transformador">Transformador</option>
              </Select>
            </div>
          </div>

          {/* Correo */}
          <div>
            <label className="block text-[17px] font-bold text-ink-800 mb-1.5" htmlFor="email">
              Correo electrónico 
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@personal.com"
              required
              className="w-full rounded-2xl border border-surface-400 px-4 py-3 text-sm font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 transition-colors hover:border-surface-400 focus:border-[#23ce6b] focus:outline-none"
            />
          </div>

          {/* Contraseña con validador y show/hide */}
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
              {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
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
