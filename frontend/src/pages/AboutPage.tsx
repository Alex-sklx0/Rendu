// Pagina Sobre Nosotros (About Us)

import { Link } from "react-router-dom";
import { FAMILIAS_MATERIAL, MUNICIPIOS_VALLE_ABURRA } from "@/lib/constants";

export default function AboutPage() {
  const pilares = [
    {
      title: "Economía Circular",
      desc: "Promovemos el aprovechamiento de materias primas secundarias, extendiendo el ciclo de vida de los materiales y minimizando los residuos que llegan a disposición final.",
    },
    {
      title: "Conexión Directa",
      desc: "Enlazamos sin intermediarios a empresas generadoras con transformadores y recicladores en el Valle de Aburrá mediante canales de contacto directos.",
    },
    {
      title: "Impacto Ambiental y Sostenible",
      desc: "Contribuimos a las metas de sostenibilidad regional y reducción de huella de carbono, optimizando la cadena de valor de los subproductos industriales.",
    },
    {
      title: "Oportunidad Económica",
      desc: "Transformamos costos de disposición en ingresos y oportunidades de suministro competitivo para la industria transformadora local.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-16">
      {/* Hero Section */}
      <section className="text-center space-y-4 pt-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-forest-900 sm:text-5xl">
          Transformando residuos en{" "}
          <span className="text-[#23ce6b]">recursos de valor</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base text-ink-600 sm:text-lg leading-relaxed">
          Rendu es una plataforma digital diseñada para impulsar la simbiosis industrial y la economía circular en los 10 municipios del Valle de Aburrá.
        </p>
      </section>

      {/* Misión y Visión */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-surface-200 bg-white p-8 shadow-sm space-y-3">

          <h2 className="text-2xl font-extrabold text-ink-900">Nuestra Misión</h2>
          <p className="text-sm text-ink-600 leading-relaxed">
            Facilitar el intercambio, comercialización y aprovechamiento de subproductos entre empresas generadoras, transformadoras y recicladores en el Valle de Aburrá, minimizando el impacto ambiental de los residuos sólidos.
          </p>
        </div>

        <div className="rounded-3xl border border-surface-200 bg-white p-8 shadow-sm space-y-3">
          <h2 className="text-2xl font-extrabold text-ink-900">Nuestra Visión</h2>
          <p className="text-sm text-ink-600 leading-relaxed">
            Consolidarnos como el punto de referencia regional en simbiosis industrial y valorización de materiales secundarios, impulsando a Antioquia hacia un modelo productivo plenamente circular, competitivo y sostenible.
          </p>
        </div>
      </section>

      {/* Pilares */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-forest-900">
            Nuestros Valores y Principios
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {pilares.map((p, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm hover:border-[#23ce6b]/50 transition-colors space-y-3"
            >
              <h3 className="text-lg font-bold text-ink-900">{p.title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Materiales y Cobertura */}
      <section className="rounded-3xl border border-surface-200 bg-white p-8 sm:p-10 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Familias */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-ink-900 flex items-center gap-2">
              <span>Familias de Materiales</span>
            </h3>
            <p className="text-xs text-ink-500">
              Clasificación alineada con la Resolución SSPD 20211000650805:
            </p>
            <div className="flex flex-wrap gap-2">
              {FAMILIAS_MATERIAL.map((f) => (
                <span
                  key={f.id}
                  className="rounded-2xl border border-surface-200 bg-surface-50 px-3.5 py-1.5 text-xs font-semibold text-ink-700"
                >
                  {f.nombre}
                </span>
              ))}
            </div>
          </div>

          {/* Cobertura */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-ink-900 flex items-center gap-2">
              <span>Cobertura Metropolitana</span>
            </h3>
            <p className="text-xs text-ink-500">
              Conexión activa en los 10 municipios del Valle de Aburrá:
            </p>
            <div className="flex flex-wrap gap-2">
              {MUNICIPIOS_VALLE_ABURRA.map((m) => (
                <span
                  key={m}
                  className="rounded-2xl border border-[#23ce6b]/20 bg-[#dff4ed]/50 px-3 py-1.5 text-xs font-semibold text-[#00805b]"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="rounded-3xl bg-forest-900 p-8 sm:p-12 text-center text-white space-y-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-black">
          ¿Listo para ser parte de la economía circular?
        </h2>
        <p className="text-lg text-ink-700 max-w-lg mx-auto leading-relaxed">
          Explora los subproductos disponibles o registra tu empresa para publicar materiales y conectar con transformadores.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            to="/catalog"
            className="rounded-2xl bg-[#23ce6b] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1fb85f] transition-colors"
          >
            Explorar catálogo
          </Link>
          <Link
            to="/contact"
            className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition-colors"
          >
            Contáctanos
          </Link>
        </div>
      </section>
    </div>
  );
}
