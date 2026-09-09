import { Link } from "react-router-dom";
import { RenduLogo } from "@/components/ui/RenduLogo";

export default function HomePage() {
  const wireframeScreens = [
    { name: "splash", path: "/splash", title: "Pantalla Splash (Logo)", desc: "Logo minimalista centrado" },
    { name: "splash1", path: "/splash1", title: "Onboarding 1", desc: "Conecta tus subproductos" },
    { name: "splash2", path: "/splash2", title: "Onboarding 2", desc: "Eficiencia del transporte" },
    { name: "splash3", path: "/splash3", title: "Onboarding 3", desc: "Certificación y seguridad" },
    { name: "login", path: "/login", title: "Inicio de sesión", desc: "Login y acceso a registro" },
    { name: "pre_register", path: "/pre_register", title: "¿Quién eres?", desc: "Selección Persona vs Empresa" },
    { name: "registro_persona", path: "/registro_persona", title: "Registro Persona", desc: "Formulario para persona/reciclador" },
    { name: "registro_empresa", path: "/registro_empresa", title: "Registro Empresa", desc: "Formulario para empresas/generadores" },
    { name: "communication", path: "/communication", title: "Medio de comunicación", desc: "Configuración de canal preferido" },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="text-center py-6">
        <div className="flex justify-center mb-3">
          <RenduLogo size="lg" />
        </div>
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-forest-600 mb-2">
          Mercado Digital de Economía Circular
        </p>
        <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl mb-3">
          Plataforma RENDU
        </h1>
        <p className="text-ink-500 max-w-lg mx-auto leading-relaxed text-sm sm:text-base">
          Conecta empresas del Valle de Aburrá para dar una segunda vida a materiales y subproductos industriales.
        </p>

        {/* Action button to launch full onboarding experience */}
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/splash"
            className="inline-flex items-center gap-2 rounded-xl bg-[#23ce6b] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f]"
          >
            Iniciar flujo desde Splash →
          </Link>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-6 py-3 text-sm font-bold text-ink-800 shadow-sm transition-colors hover:bg-surface-50"
          >
            Ver catálogo
          </Link>
        </div>
      </div>

      {/* ── Wireframe Screens Section ────────────────────────────── */}
      <div className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-ink-900">
              Pantallas basadas en los wireframes PNG
            </h2>
            <p className="text-xs text-ink-500 mt-1">
              Cada pantalla replica exactamente el diseño de su respectivo archivo en <code className="bg-surface-100 px-1 py-0.5 rounded text-forest-800">img/wireframes/</code>
            </p>
          </div>
          <span className="mt-2 sm:mt-0 self-start inline-flex items-center rounded-full bg-[#dff4ed] px-3 py-1 text-xs font-bold text-forest-700">
            {wireframeScreens.length} pantallas
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wireframeScreens.map((screen) => (
            <Link
              key={screen.name}
              to={screen.path}
              className="group flex flex-col justify-between rounded-2xl border border-surface-200 bg-surface-50 p-5 transition-all hover:border-[#23ce6b] hover:bg-white hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-white border border-surface-200 px-2 py-0.5 font-mono text-[11px] font-bold text-[#23ce6b]">
                    {screen.name}.png
                  </span>
                  <span className="text-xs font-bold text-ink-400 group-hover:text-[#23ce6b] transition-colors">
                    Abrir →
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-ink-900 group-hover:text-forest-800 transition-colors">
                  {screen.title}
                </h3>
                <p className="mt-1 text-xs text-ink-500">
                  {screen.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── App Views (Marketplace) ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
        <Link
          to="/catalogo"
          className="card group hover:border-forest-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-forest-700/10 flex items-center justify-center text-forest-700 group-hover:bg-forest-700 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-ink-900">Catálogo</h3>
              <p className="text-xs text-ink-500">Explorar materiales</p>
            </div>
          </div>
        </Link>

        <Link
          to="/publicar"
          className="card group hover:border-forest-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-clay-400/10 flex items-center justify-center text-clay-500 group-hover:bg-clay-500 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-ink-900">Publicar</h3>
              <p className="text-xs text-ink-500">Nuevo subproducto</p>
            </div>
          </div>
        </Link>

        <Link
          to="/matching"
          className="card group hover:border-forest-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-forest-700/10 flex items-center justify-center text-forest-700 group-hover:bg-forest-700 group-hover:text-white transition-colors font-bold">
              ↔
            </div>
            <div>
              <h3 className="font-semibold text-ink-900">Matching</h3>
              <p className="text-xs text-ink-500">Emparejar oferta/demanda</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
