// Pagina con el detalle publico de una publicacion (HU-16, HU-17, HU-19)

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { getPublicacion, manifestarInteres, getContactoInteres, getToken } from "@/api/client";
import type { SubproductoDetalle, ContactoInfo } from "@/types";
import  inlineSvg19 from "@/img/handshake.svg";

export default function SubproductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subproducto, setSubproducto] = useState<SubproductoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [isSubmittingInteres, setIsSubmittingInteres] = useState(false);
  const [contactoInfo, setContactoInfo] = useState<ContactoInfo | null>(null);

  useEffect(() => {
    async function loadItem() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicacion(id);
        setSubproducto(data);

        // Si ya manifestó interés y está autenticado, precargar contacto
        if (data.ya_manifeste_interes && getToken()) {
          getContactoInteres(id)
            .then(setContactoInfo)
            .catch(() => {});
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el detalle.");
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  useEffect(() => {
    if (!contactModalOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContactModalOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [contactModalOpen]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-600 border-t-transparent" />
          <p className="text-sm font-medium text-ink-500">Cargando información del material...</p>
        </div>
      </div>
    );
  }

  if (error || !subproducto) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
          <span className="text-4xl">⚠️</span>
          <h2 className="mt-3 text-lg font-bold text-red-900">
            {error || "Material no encontrado"}
          </h2>
          <p className="mt-1 text-sm text-red-700">
            El subproducto que buscas no existe o ha sido retirado del catálogo.
          </p>
          <div className="mt-6">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-xl bg-forest-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-900"
            >
              ← Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isDisponible = subproducto.disponible !== false;

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let currentUser: { id_empresa?: string | number } | null = null;
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch {
      // Ignorar error de parseo
    }
  }

  const isOwner = Boolean(
    subproducto.es_mia ||
    (currentUser?.id_empresa &&
      subproducto.id_empresa &&
      Number(currentUser.id_empresa) === Number(subproducto.id_empresa))
  );

  const yaManifeste = Boolean(subproducto.ya_manifeste_interes);

  // Manejador para manifestar interés (HU-17)
  async function handleManifestarInteres() {
    if (!subproducto) return;

    if (!getToken()) {
      navigate("/login", { state: { returnTo: `/catalog/${subproducto.id}` } });
      return;
    }

    setActionError(null);
    setIsSubmittingInteres(true);

    try {
      const res = await manifestarInteres(subproducto.id);
      setSubproducto((prev) => (prev ? { ...prev, ya_manifeste_interes: true } : null));
      setContactoInfo(res.contacto);
      setContactModalOpen(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al manifestar interés.");
    } finally {
      setIsSubmittingInteres(false);
    }
  }


  return (
    <div className="mx-auto mt-8 max-w-5xl pb-16">
      {/* Boton para volver al catalogo */}
      <div className="mb-6">
        <motion.button
          type="button"
          onClick={() => navigate("/catalog")}
          whileHover={{ x: -12 }}
          whileTap={{ x: -3 }}
          transition={{ type: "spring", stiffness: 340, damping: 26, mass: 0.7 }}
          className="relative -left-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-lg font-bold text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600/40"
        >
          ← Volver al catálogo
        </motion.button>
      </div>

      {/* Alerta si el material ya no está disponible */}
      {!isDisponible && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold">Esta publicación ya no está disponible</h3>
            <p className="text-sm text-amber-800">
              El material se encuentra agotado o sin disponibilidad en este momento.
            </p>
          </div>
        </div>
      )}

      {actionError && (
        <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {actionError}
        </div>
      )}

      {/* Distribucion de la pagina en dos columnas */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Columna izquierda con la foto */}
        <div className="lg:col-span-5">
          <div className="relative flex h-72 w-full items-center justify-center overflow-hidden rounded-3xl bg-[#cce9df] shadow-sm lg:h-96">
            {!isDisponible && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-extrabold tracking-wide text-white shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-amber-200 animate-pulse" />
                  Sin stock
                </span>
              </div>
            )}
            {subproducto.image_url ? (
              <img
                src={subproducto.image_url}
                alt={`Foto de ${subproducto.nombre}`}
                className={`h-full w-full object-cover ${!isDisponible ? "grayscale-[25%] opacity-90" : ""}`}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[#23ce6b]/60 text-[#23ce6b]" aria-label="Sin fotografía">
                <span className="text-4xl" aria-hidden="true">+</span>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha con detalles y contacto */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8">            

            {/* Categoria del material */}
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#DFF4ED] px-3.5 py-2 text-sm font-bold text-forest-700">
                Categoría: {subproducto.familia}
              </span>
            </div>

            {/* Nombre del material */}
            <h1 className="mt-6 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {subproducto.nombre}
            </h1>

            {/* Empresa que publica el material */}
            <p className="mt-4 font-medium text-ink-700">
              Publicación de <span className="font-bold text-forest-800 ">{subproducto.empresa}</span>
            </p>

            {/* Datos de cantidad disponible y ubicacion */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#f6f8f7] p-4 border border-surface-200">
                <span className="text-xs font-medium text-ink-700">
                  {isDisponible ? "Cantidad disponible" : "Lote habitual"}
                </span>
                <span className="block text-xl font-extrabold text-forest-800">
                  {subproducto.volumen_disponible.toLocaleString("es-CO")} {subproducto.unidad_volumen}
                </span>
              </div>

              <div className="rounded-2xl bg-[#f6f8f7] p-4 border border-surface-200">
                <span className="text-xs font-medium text-ink-700">Ubicación</span>
                <span className="block text-xl font-extrabold text-forest-800">
                  {subproducto.municipio}
                </span>
              </div>
            </div>

            {/* Seccion de descripcion */}
            <div className="mt-6 border-t border-surface-100 pt-6">
              <h2 className="text-lg font-bold uppercase tracking-wider text-ink-900">
                Descripción
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-900">
                {subproducto.descripcion || "Sin descripción proporcionada."}
              </p>
            </div>

            {/* Botones de acción segun sesión e interés */}
            <div className="mt-8 border-t border-surface-100 pt-6">
              {isOwner ? (
                <div className="flex flex-col items-start gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[17px] font-semibold text-blue-900">
                    Esta es tu publicación. Puedes editarla o ver los interesados desde tu perfil.
                  </p>
                  <Link
                    to="/profile"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-blue-600 px-6 py-3.5 text-[17px] font-bold text-white hover:bg-blue-700"
                  >
                    Ir a mis publicaciones →
                  </Link>
                </div>
              ) : !isDisponible ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 px-6 py-3.5 text-base font-bold text-white shadow-sm opacity-70 cursor-not-allowed"
                >
                  No disponible para contacto (sin stock)
                </button>
              ) : yaManifeste ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center justify-center rounded-2xl bg-[#dff4ed] border border-[#23ce6b]/40 px-4 py-3 text-[15px] font-bold text-forest-900">
                     Ya manifestaste interés, espera a que la empresa responda.
                  </div>
                  {/*  <button
                    type="button"
                    onClick={handleAbrirContacto}
                    disabled={isSubmittingInteres}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#23ce6b] px-6 py-3.5 text-base font-bold text-white shadow-sm hover:bg-[#1fb85f] transition-all"
                  >
                    {isSubmittingInteres ? "Cargando..." : "Contactar a la empresa"}
                  </button> */}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleManifestarInteres}
                  disabled={isSubmittingInteres}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#23ce6b] px-6 py-3.5 text-base font-bold text-white shadow-sm hover:bg-[#1fb85f] active:scale-[0.99] transition-all disabled:opacity-60"
                >
                  {isSubmittingInteres ? "Enviando interés..." : "Me interesa"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación y contacto */}
      <AnimatePresence>
        {contactModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-sm px-4"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setContactModalOpen(false);
            }}
          >
            <motion.div
              className="w-full max-w-lg rounded-3xl border border-surface-200 bg-white p-6 sm:p-8 text-center shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-modal-title"
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 24,
                mass: 0.8,
              }}
            >
              <div className="mx-auto flex h-36 w-36 items-center justify-center text-3xl">
                <img src={inlineSvg19} width="200" height="200" alt="" />
              </div>
              <h2 id="contact-modal-title" className="mt-4 text-2xl font-extrabold text-ink-900">
                ¡Interés registrado!
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                Has manifestado interés en <span className="font-bold text-ink-900">"{subproducto.nombre}"</span> de{" "}
                <span className="font-bold text-forest-800c">{subproducto.empresa}</span>.
              </p>

              {/* Informacion de contacto lista devuelta por el backend */}
              <div className="mt-6 rounded-2xl bg-surface-50 border border-surface-200 p-5 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  Canal de contacto de la empresa
                </span>
                
                {contactoInfo?.medio && (
                  <p className="mt-1 text-base font-bold text-ink-900">
                    Medio: <span className="text-[#00805b]">{contactoInfo.medio}</span>
                  </p>
                )}

                {contactoInfo?.contacto && (
                  <p className="mt-1 text-sm text-ink-700">
                    Contacto: <span className="font-mono font-medium">{contactoInfo.contacto}</span>
                  </p>
                )}

                {contactoInfo?.link ? (
                  <div className="mt-4">
                    <a
                      href={contactoInfo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#23ce6b] px-5 py-3 text-sm font-bold text-white shadow transition-all hover:bg-[#1fb85f]"
                    >
                      Abrir {contactoInfo.medio || "enlace directo"} ↗
                    </a>
                  </div>
                ) : (
                  <p className="mt-3 text-xs italic text-ink-600 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                    {contactoInfo?.mensaje || "La empresa no tiene un medio de contacto registrado o no se pudo armar el enlace directo."}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-surface-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface-100"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
