// Modal para editar los datos del perfil del usuario (Persona o Empresa)
// Reutiliza los campos de registro y agrega selector de medio de contacto con validacion dinamica

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MUNICIPIOS_VALLE_ABURRA } from "@/lib/constants";
import { Select } from "@/components/ui/Select";
import { getMediosContacto, actualizarPerfilEmpresa, actualizarPerfilPersona } from "@/api/client";
import { resolveContactMethod } from "@/lib/contactMethods";
import type { MedioContacto } from "@/types";

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    id?: number;
    email?: string;
    nombre?: string;
    id_empresa?: string | number | null;
    id_persona?: string | number | null;
    tipo?: "EMPRESA" | "PERSONA" | null;
    id_rol?: number | null;
    medio_contacto?: string | null;
    id_medio_contacto?: number | null;
    contacto?: string | null;
    municipio?: string | null;
    cedula?: string | null;
    nit?: string | null;
  };
  onSuccess: (updated: {
    nombre: string;
    municipio: string;
    id_rol: number;
    nit?: string;
    cedula?: string;
    contacto?: string | null;
    medio_contacto?: string | null;
    id_medio_contacto?: number | null;
  }) => void;
}

export default function EditProfileModal({ isOpen, onClose, userData, onSuccess }: EditProfileModalProps) {
  const isEmpresa = userData.tipo === "EMPRESA" || (!userData.tipo && Boolean(userData.id_empresa));

  // Campos de formulario
  const [nombre, setNombre] = useState(userData.nombre || "");
  const [documento, setDocumento] = useState(isEmpresa ? (userData.nit || "") : (userData.cedula || ""));
  const [municipio, setMunicipio] = useState(userData.municipio || "Medellín");
  const [rol, setRol] = useState<number>(userData.id_rol || (isEmpresa ? 1 : 3));

  // Medio de contacto y dato
  const [mediosDisponibles, setMediosDisponibles] = useState<MedioContacto[]>([]);
  const [selectedMedioId, setSelectedMedioId] = useState<number | string>(userData.id_medio_contacto || 1);
  const [selectedMedioNombre, setSelectedMedioNombre] = useState<string>(userData.medio_contacto || "WhatsApp");
  const [contactoValor, setContactoValor] = useState<string>(userData.contacto || "");

  // Estados de proceso y error
  const [contactoError, setContactoError] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar medios de contacto desde la BD
  useEffect(() => {
    let isMounted = true;
    getMediosContacto()
      .then((medios) => {
        if (!isMounted) return;
        setMediosDisponibles(medios);
        if (medios.length > 0 && !userData.id_medio_contacto) {
          setSelectedMedioId(medios[0].id);
          setSelectedMedioNombre(medios[0].nombre);
        } else if (userData.id_medio_contacto) {
          const match = medios.find((m) => Number(m.id) === Number(userData.id_medio_contacto));
          if (match) {
            setSelectedMedioId(match.id);
            setSelectedMedioNombre(match.nombre);
          }
        }
      })
      .catch((err) => console.error("Error al cargar medios:", err));
    return () => { isMounted = false; };
  }, [userData.id_medio_contacto]);

  // Sincronizar datos iniciales cuando se abra el modal
  useEffect(() => {
    if (isOpen) {
      setNombre(userData.nombre || "");
      setDocumento(isEmpresa ? (userData.nit || "") : (userData.cedula || ""));
      setMunicipio(userData.municipio || "Medellín");
      setRol(userData.id_rol || (isEmpresa ? 1 : 3));
      setContactoValor(userData.contacto || "");
      if (userData.medio_contacto) setSelectedMedioNombre(userData.medio_contacto);
      if (userData.id_medio_contacto) setSelectedMedioId(userData.id_medio_contacto);
      setContactoError(null);
      setErrorGeneral(null);
    }
  }, [isOpen, userData, isEmpresa]);

  // Formateador de NIT
  function handleNitChange(val: string) {
    const raw = val.replace(/[^\d]/g, "").slice(0, 10);
    if (raw.length > 9) {
      setDocumento(`${raw.slice(0, 9)}-${raw.slice(9, 10)}`);
    } else {
      setDocumento(raw);
    }
  }

  // Formateador de Cédula
  function handleCedulaChange(val: string) {
    const raw = val.replace(/[^\d]/g, "").slice(0, 10);
    setDocumento(raw);
  }

  // Cambio de medio de contacto seleccionado
  function handleSelectMedio(medio: MedioContacto) {
    setSelectedMedioId(medio.id);
    setSelectedMedioNombre(medio.nombre);
    // Revalidar el contacto con las reglas del nuevo medio si ya hay texto
    if (contactoValor.trim()) {
      const config = resolveContactMethod(medio.nombre);
      const res = config.validate(contactoValor);
      setContactoError(res.valid ? null : (res.error || "Formato no válido"));
    } else {
      setContactoError(null);
    }
  }

  // Validar dato de contacto en tiempo real
  function handleContactoChange(val: string) {
    setContactoValor(val);
    if (!val.trim()) {
      setContactoError(null);
      return;
    }
    const config = resolveContactMethod(selectedMedioNombre);
    const res = config.validate(val);
    setContactoError(res.valid ? null : (res.error || "Formato no válido"));
  }

  // Configuración visual del método actual (icono, placeholder, etc.)
  const activeMethodConfig = resolveContactMethod(selectedMedioNombre);

  // Envío del formulario
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorGeneral(null);

    if (!nombre.trim()) {
      setErrorGeneral("El nombre es obligatorio.");
      return;
    }

    if (!documento.trim()) {
      setErrorGeneral(isEmpresa ? "El NIT es obligatorio." : "La cédula es obligatoria.");
      return;
    }

    // Validar contacto si se ingresó y es empresa
    if (isEmpresa && contactoValor.trim()) {
      const validacion = activeMethodConfig.validate(contactoValor);
      if (!validacion.valid) {
        setContactoError(validacion.error || "Formato de contacto inválido.");
        return;
      }
    }

    setIsSubmitting(true);
    const idMunicipio = MUNICIPIOS_VALLE_ABURRA.indexOf(municipio) + 1;

    try {
      if (isEmpresa) {
        const idEmpresa = userData.id_empresa;
        if (!idEmpresa) throw new Error("No se encontró el ID de la empresa a editar.");

        await actualizarPerfilEmpresa(idEmpresa, {
          nombre: nombre.trim(),
          nit: documento.trim(),
          id_municipio: idMunicipio,
          id_rol: Number(rol),
          contacto: contactoValor.trim() || null,
          id_medio_contacto: contactoValor.trim() ? Number(selectedMedioId) : null,
        });

        onSuccess({
          nombre: nombre.trim(),
          nit: documento.trim(),
          municipio,
          id_rol: Number(rol),
          contacto: contactoValor.trim() || null,
          medio_contacto: contactoValor.trim() ? selectedMedioNombre : null,
          id_medio_contacto: contactoValor.trim() ? Number(selectedMedioId) : null,
        });
      } else {
        const idPersona = userData.id_persona || userData.id;
        if (!idPersona) throw new Error("No se encontró el ID de la persona a editar.");

        await actualizarPerfilPersona(idPersona, {
          nombre: nombre.trim(),
          cedula: documento.trim(),
          id_municipio: idMunicipio,
          id_rol: Number(rol),
        });

        onSuccess({
          nombre: nombre.trim(),
          cedula: documento.trim(),
          municipio,
          id_rol: Number(rol),
        });
      }

      onClose();
    } catch (err) {
      setErrorGeneral(err instanceof Error ? err.message : "Error al guardar los cambios.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-sm px-4 py-6 overflow-y-auto"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="w-full max-w-xl rounded-3xl border border-surface-200 bg-white p-6 sm:p-8 shadow-2xl my-auto text-left"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 25 }}
          >
            {/* Encabezado */}
            <div className="flex items-center justify-between border-b border-surface-100 pb-4 mb-5">
              <div>
                <h2 id="edit-profile-title" className="text-2xl font-extrabold text-ink-900">
                  Editar perfil
                </h2>
                <p className="text-xs text-ink-500 mt-0.5">
                  {isEmpresa ? "Actualiza los datos de tu empresa y canal de contacto" : "Actualiza tus datos personales"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-100 text-ink-500 hover:bg-surface-200 transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Error general */}
            {errorGeneral && (
              <div className="mb-5 rounded-2xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-200">
                {errorGeneral}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre y Documento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-1" htmlFor="edit-nombre">
                    {isEmpresa ? "Razón Social" : "Nombre Completo"}
                  </label>
                  <input
                    id="edit-nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder={isEmpresa ? "Ej. Fibretex S.A.S." : "Ej. Juan Pérez"}
                    className="w-full rounded-xl border border-surface-300 px-3.5 py-2.5 text-sm font-semibold text-ink-900 placeholder:text-ink-400 focus:border-[#23ce6b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-1" htmlFor="edit-doc">
                    {isEmpresa ? "NIT (con dígito)" : "Cédula de Ciudadanía"}
                  </label>
                  <input
                    id="edit-doc"
                    type="text"
                    value={documento}
                    onChange={(e) => isEmpresa ? handleNitChange(e.target.value) : handleCedulaChange(e.target.value)}
                    required
                    maxLength={isEmpresa ? 11 : 10}
                    placeholder={isEmpresa ? "Ej. 900123456-1" : "Ej. 1020304050"}
                    className="w-full rounded-xl border border-surface-300 px-3.5 py-2.5 text-sm font-mono font-semibold text-ink-900 placeholder:text-ink-400 focus:border-[#23ce6b] focus:outline-none"
                  />
                </div>
              </div>

              {/* Municipio y Rol */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-1" htmlFor="edit-municipio">
                    Municipio
                  </label>
                  <Select id="edit-municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)}>
                    {MUNICIPIOS_VALLE_ABURRA.map((mun) => (
                      <option key={mun} value={mun}>{mun}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-1" htmlFor="edit-rol">
                    {isEmpresa ? "Tipo de Empresa" : "Tipo de Actividad"}
                  </label>
                  <Select
                    id="edit-rol"
                    value={rol}
                    onChange={(e) => setRol(Number(e.target.value))}
                  >
                    {isEmpresa ? (
                      <>
                        <option value={1}>Generador</option>
                        <option value={2}>Transformador</option>
                      </>
                    ) : (
                      <>
                        <option value={3}>Reciclador</option>
                        <option value={2}>Transformador</option>
                      </>
                    )}
                  </Select>
                </div>
              </div>

              {/* SECCIÓN DE MEDIO DE CONTACTO (Solo para empresas) */}
              {isEmpresa && (
                <div className="rounded-2xl border border-surface-200 bg-surface-50/70 p-4 space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-forest-800">
                      Canal de contacto preferido
                    </label>
                    <span className="text-[11px] font-semibold text-ink-400">
                      Visible para interesados
                    </span>
                  </div>

                  {/* Botones / Selector de Medios con sus logos SVG */}
                  <div className="flex flex-wrap gap-2">
                    {mediosDisponibles.map((medio) => {
                      const isSelected = String(medio.id) === String(selectedMedioId);
                      const visual = resolveContactMethod(medio.nombre);
                      return (
                        <button
                          key={medio.id}
                          type="button"
                          onClick={() => handleSelectMedio(medio)}
                          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#23ce6b] text-white shadow-sm ring-2 ring-[#23ce6b]/40 scale-[1.02]"
                              : "bg-white text-ink-700 border border-surface-200 hover:bg-surface-100"
                          }`}
                        >
                          <img
                            src={visual.icon}
                            alt=""
                            width={16}
                            height={16}
                            className={isSelected ? "brightness-0 invert" : ""}
                          />
                          <span>{medio.nombre.charAt(0).toUpperCase() + medio.nombre.slice(1).toLowerCase()}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Input con validación dinámica reutilizada */}
                  <div className="space-y-1 pt-1">
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center pointer-events-none">
                        <img src={activeMethodConfig.icon} alt="" width={18} height={18} />
                      </div>
                      <input
                        type="text"
                        value={contactoValor}
                        onChange={(e) => handleContactoChange(e.target.value)}
                        placeholder={activeMethodConfig.placeholder}
                        className={`w-full rounded-xl border bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-ink-900 placeholder:text-ink-400 placeholder:font-normal transition-colors focus:outline-none ${
                          contactoError
                            ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                            : "border-surface-300 focus:border-[#23ce6b]"
                        }`}
                      />
                    </div>

                    {/* Mensaje de validación dinámico */}
                    {contactoError ? (
                      <p className="text-xs font-bold text-red-600 mt-1 pl-1">
                        ⚠️ {contactoError}
                      </p>
                    ) : contactoValor.trim() ? (
                      <p className="text-[11px] font-semibold text-[#00805b] mt-0.5 pl-1">
                        ✓ Formato correcto para {activeMethodConfig.name}
                      </p>
                    ) : (
                      <p className="text-[11px] text-ink-400 pl-1">
                        {activeMethodConfig.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-ink-600 hover:bg-surface-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(contactoError)}
                  className="rounded-xl bg-[#23ce6b] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[#1fb85f] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
