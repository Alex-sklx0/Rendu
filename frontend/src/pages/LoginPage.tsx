import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RenduLogo } from "@/components/ui/RenduLogo";
import { loginUsuario } from "@/api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor completa tu correo y contraseña.");
      return;
    }
    setError(null);
    try {
      const res = await loginUsuario({ email, password });
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify({
        id: res.usuario.id,
        email: res.usuario.email,
        nombre: res.usuario.nombre || res.empresa?.nombre || email.split('@')[0],
        id_empresa: res.usuario.id_empresa || res.empresa?.id || null,
      }));
      navigate("/catalogo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-[#eef2f0] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm sm:p-10">
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <div className="flex justify-center mb-4">
          <RenduLogo size="lg" />
        </div>

        {/* ── Title & Subtitle ─────────────────────────────────────── */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-ink-900">
            Inicio de sesión
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-ink-500">
            Encuentra, publica e intercambia subproductos aprovechables.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-center text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* ── Form ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-800 mb-1.5" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@correo.com"
              className="w-full rounded-xl border border-surface-200 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 focus:border-[#23ce6b] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-800 mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-surface-200 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 focus:border-[#23ce6b] focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-[#23ce6b] py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f]"
            >
              Iniciar sesión
            </button>
          </div>
        </form>

        {/* ── Divider 'o' ──────────────────────────────────────────── */}
        <div className="my-5 flex items-center justify-center">
          <span className="text-xs font-medium text-ink-400">o</span>
        </div>

        {/* ── Secondary CTA: Registrar mi empresa / Registrarse ────── */}
        <div className="space-y-3">
          <Link
            to="/pre_register"
            className="flex w-full items-center justify-center rounded-xl border-2 border-[#23ce6b] bg-white py-2.5 text-sm font-bold text-[#23ce6b] transition-colors hover:bg-[#23ce6b]/5"
          >
            Registrarme
          </Link>
         
        </div>
      </div>
    </div>
  );
}
