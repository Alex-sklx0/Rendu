// Pagina de inicio de sesion

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RenduLogo } from "@/components/ui/RenduLogo";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { loginUsuario } from "@/api/client";
import { MUNICIPIOS_VALLE_ABURRA } from "@/lib/constants";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Envio del formulario de logeo
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  
    // Validacion de campos requeridos
    if (!email || !password) {
      setError("Por favor completa tu correo y contraseña.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await loginUsuario({ email, password });

      // Guardar datos de sesion localmente
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify({
        id: res.usuario.id,
        email: res.usuario.email,
        nombre: res.usuario.nombre || res.empresa?.nombre || email.split('@')[0],
        id_empresa: res.usuario.id_empresa || res.empresa?.id || null,
        tipo: res.empresa
          ? res.empresa.id_rol === 1
            ? "Generador"
            : "Transformador"
          : res.persona?.id_rol === 3
            ? "Reciclador"
            : "Transformador",
        municipio: MUNICIPIOS_VALLE_ABURRA[
          (res.empresa?.id_municipio ?? res.persona?.id_municipio ?? 0) - 1
        ],
      }));

      // Redirigir al catalogo
      navigate("/catalog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-[#eef2f0] px-4 py-10">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl sm:p-12">
        {/* Decoracion verde de la esquina estilo splash */}
        <div className="pointer-events-none absolute left-6 top-6 h-12 w-24 rounded-tl-2xl border-l-4 border-t-4 border-[#23ce6b]" />

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <RenduLogo size="lg" />
        </div>

        {/* Titulo y subtitulo aumentados de tamaño */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
            Iniciar sesión
          </h1>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Formulario de login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block  text-xs sm:text-[17px] font-bold text-ink-800 mb-3" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@correo.com"
              required
              className="w-full rounded-2xl border border-surface-400 px-4 py-3 text-sm font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-500 transition-colors hover:border-surface-400 focus:border-[#23ce6b] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[17px] font-bold text-ink-800 mb-3" htmlFor="password">
              Contraseña
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#23ce6b] py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </div>
        </form>

        {/* Separador "o" */}
        <div className="my-6 flex items-center justify-center">
          <div className="h-px flex-1 bg-surface-200" />
          <span className="px-3 text-xs font-semibold text-ink-400 uppercase tracking-wider">o</span>
          <div className="h-px flex-1 bg-surface-200" />
        </div>

        {/* Enlace para registrarse */}
        <div>
          <Link
            to="/pre-register"
            className="flex w-full items-center justify-center rounded-2xl border-2 border-[#23ce6b] bg-white py-3 text-sm sm:text-base font-bold text-[#23ce6b] transition-colors hover:bg-[#23ce6b]/5"
          >
            Crear una cuenta nueva
          </Link>
        </div>
      </div>
    </div>
  );
}
