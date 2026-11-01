// Pagina de Contacto (Contact Us)

import { useState } from "react";

export default function ContactPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [asunto, setAsunto] = useState("Consulta general");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      setError("Por favor completa tu nombre, correo electrónico y mensaje.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setError(null);
    setEnviado(true);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16">
      {/* Encabezado */}
      <section className="text-center space-y-3 pt-4">
        
        <h1 className="text-4xl font-extrabold tracking-tight text-forest-900 sm:text-5xl">
          Contáctanos
        </h1>
        <p className="mx-auto max-w-2xl text-base text-ink-600 leading-relaxed">
          ¿Tienes preguntas sobre la plataforma, sugerencias o deseas vincular a tu empresa? Estamos aquí para ayudarte.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Información de Contacto Directo */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-ink-900">Canales de Atención</h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
              
                <div>
                  <strong className="block font-bold text-ink-800">Correo Electrónico</strong>
                  <a
                    href="mailto:contacto@rendu.com.co"
                    className="text-forest-700 hover:text-[#23ce6b] font-medium underline-offset-2 hover:underline"
                  >
                    contacto@rendu.com.co
                  </a>
                </div>
              </div>


              <div className="flex items-start gap-3">
                
                <div>
                  <strong className="block font-bold text-ink-800">Horario de Soporte</strong>
                  <p className="text-ink-600">
                    Lunes a Viernes: 8:00 AM – 5:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Formulario de Mensaje */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-surface-200 bg-white p-6 sm:p-10 shadow-sm">
            {enviado ? (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dff4ed] text-3xl">
                  ✓
                </div>
                <h3 className="text-2xl font-extrabold text-ink-900">
                  ¡Mensaje enviado con éxito!
                </h3>
                <p className="max-w-md mx-auto text-sm text-ink-600">
                  Gracias por comunicarte con Rendu, <strong>{nombre}</strong>. Hemos recibido tu solicitud y te responderemos a <strong>{email}</strong> a la mayor brevedad.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEnviado(false);
                    setNombre("");
                    setEmail("");
                    setEmpresa("");
                    setMensaje("");
                  }}
                  className="rounded-2xl border border-surface-300 bg-white px-6 py-2.5 text-sm font-bold text-ink-700 hover:bg-surface-100 transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-extrabold text-ink-900">Envíanos un mensaje</h2>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-800">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full rounded-2xl border border-surface-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-[#23ce6b] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-800">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full rounded-2xl border border-surface-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-[#23ce6b] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-800">
                      Empresa (opcional)
                    </label>
                    <input
                      type="text"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      placeholder="Nombre de tu empresa u organización"
                      className="w-full rounded-2xl border border-surface-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-[#23ce6b] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-800">
                      Asunto
                    </label>
                    <select
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      className="w-full rounded-2xl border border-surface-300 bg-white px-4 py-3 text-sm text-ink-900 focus:border-[#23ce6b] focus:outline-none"
                    >
                      <option value="Consulta general">Consulta general</option>
                      <option value="Soporte técnico">Soporte técnico</option>
                      <option value="Registro empresarial">Registro empresarial</option>
                      <option value="Alianzas y convenios">Alianzas y convenios</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-800">
                    Mensaje *
                  </label>
                  <textarea
                    rows={4}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                    className="w-full rounded-2xl border border-surface-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-[#23ce6b] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="rounded-2xl bg-[#23ce6b] px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#1fb85f] transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    Enviar mensaje
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
