// Pagina de perfil de usuario: visualizacion y edicion de datos, publicaciones e interesados

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import inlineSvg15 from "@/img/logout.svg";
import inlineSvg16 from "@/img/password-view.svg";
import inlineSvg17 from "@/img/edit.svg";
import inlineSvg18 from "@/img/delete.svg";
import inlineSvg19 from "@/img/user-plant-green.svg";
import inlineSvgPhoto from "@/img/photo.svg";
import { Link, useNavigate } from "react-router-dom";
import {
  getMisPublicaciones,
  eliminarSubproducto,
  getInteresados,
  getMe,
  clearSession,
  getToken,
  eliminarCuenta,
  subirAvatarUsuario,
} from "@/api/client";
import type { SubproductoDetalle, InteresadoItem } from "@/types";
import HoldButton from "@/components/ui/HoldButton";
import EditProfileModal from "@/components/profile/EditProfileModal";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState<SubproductoDetalle[]>([]);
  const [interesados, setInteresados] = useState<InteresadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"publicaciones" | "interesados">("publicaciones");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Estados de edicion, avatar y confirmación de eliminación
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState<{
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
    es_admin?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    getMe()
      .then((perfil) => {
        const u = {
          id: perfil.usuario.id,
          email: perfil.usuario.email,
          nombre:
            perfil.usuario.nombre ||
            perfil.empresa?.nombre ||
            perfil.persona?.nombre ||
            perfil.usuario.email.split("@")[0],
          id_empresa: perfil.usuario.id_empresa ?? perfil.empresa?.id ?? null,
          id_persona: perfil.persona?.id ?? null,
          tipo: perfil.tipo,
          es_admin: Boolean(perfil.usuario.es_admin),
          id_rol: perfil.empresa?.id_rol ?? perfil.persona?.id_rol ?? null,
          medio_contacto: perfil.empresa?.medio_contacto || null,
          id_medio_contacto: perfil.empresa?.id_medio_contacto || null,
          contacto: perfil.empresa?.contacto || null,
          municipio: perfil.empresa?.municipio || perfil.persona?.municipio || null,
          cedula: perfil.persona?.cedula || null,
          nit: perfil.empresa?.nit || null,
        };

        setUserData(u);

        // Cargar avatar persistido en localStorage o servidor
        const cachedAvatar = localStorage.getItem(`user_avatar_${perfil.usuario.id}`);
        if (cachedAvatar) {
          setAvatarUrl(cachedAvatar);
        } else if (perfil.usuario.avatar_url) {
          setAvatarUrl(perfil.usuario.avatar_url);
        }

        const promises: [Promise<SubproductoDetalle[]>, Promise<any>] = [
          u.id_empresa ? getMisPublicaciones() : Promise.resolve([]),
          u.id_empresa ? getInteresados().catch(() => ({ total: 0, interesados: [] })) : Promise.resolve({ total: 0, interesados: [] }),
        ];

        return Promise.all(promises);
      })
      .then(([misPubs, resInteresados]) => {
        setPublicaciones(misPubs);
        setInteresados(resInteresados?.interesados || []);
      })
      .catch((err) => {
        console.error("Error al cargar perfil:", err);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Cerrar sesion limpiando los datos locales
  function handleLogout() {
    clearSession();
    navigate("/catalog");
  }

  useEffect(() => {
    if (!isDeleteAccountModalOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeletingAccount) setIsDeleteAccountModalOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isDeleteAccountModalOpen, isDeletingAccount]);

  async function handleConfirmDeleteAccount() {
    if (!userData?.id) {
      setDeleteError("No se encontró el identificador de la cuenta.");
      return;
    }

    setDeleteError(null);
    setIsDeletingAccount(true);
    try {
      await eliminarCuenta(userData.id);
      setIsDeleteAccountModalOpen(false);
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo eliminar la cuenta.");
    } finally {
      setIsDeletingAccount(false);
    }
  }

  // Eliminar un subproducto propio
  async function handleDeleteSubproducto(id: string) {
    setDeleteError(null);
    try {
      await eliminarSubproducto(id);
      window.setTimeout(() => {
        setPublicaciones((prev) => prev.filter((p) => p.id !== id));
      }, 700);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Error al eliminar el subproducto.");
    }
  }

  // Manejo de seleccion de archivo de imagen de perfil
  async function handleAvatarFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsUploadingAvatar(true);
      try {
        const res = await subirAvatarUsuario(base64, avatarUrl);
        setAvatarUrl(res.avatar_url);
        if (userData?.id) {
          localStorage.setItem(`user_avatar_${userData.id}`, res.avatar_url);
        }
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.avatar_url = res.avatar_url;
            localStorage.setItem("user", JSON.stringify(parsed));
          } catch {}
        }
        window.dispatchEvent(new CustomEvent("rendu_avatar_changed", { detail: res.avatar_url }));
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error("Error al subir avatar:", err);
        alert(err instanceof Error ? err.message : "Error al subir la imagen");
      } finally {
        setIsUploadingAvatar(false);
        if (avatarInputRef.current) avatarInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  }

  // Actualizacion exitosa desde el modal
  function handleProfileUpdateSuccess(updated: {
    nombre: string;
    municipio: string;
    id_rol: number;
    nit?: string;
    cedula?: string;
    contacto?: string | null;
    medio_contacto?: string | null;
    id_medio_contacto?: number | null;
  }) {
    setUserData((prev) => (prev ? {
      ...prev,
      nombre: updated.nombre,
      municipio: updated.municipio,
      id_rol: updated.id_rol,
      nit: updated.nit !== undefined ? updated.nit : prev.nit,
      cedula: updated.cedula !== undefined ? updated.cedula : prev.cedula,
      contacto: updated.contacto !== undefined ? updated.contacto : prev.contacto,
      medio_contacto: updated.medio_contacto !== undefined ? updated.medio_contacto : prev.medio_contacto,
      id_medio_contacto: updated.id_medio_contacto !== undefined ? updated.id_medio_contacto : prev.id_medio_contacto,
    } : null));

    // Refrescar usuario en localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.nombre = updated.nombre;
        parsed.municipio = updated.municipio;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
    } catch (_) {}
  }

  const totalKg = publicaciones.reduce(
    (total, publicacion) => total + (publicacion.unidad_volumen === "kg" ? publicacion.volumen_disponible : 0),
    0
  );

  const displayName = userData?.nombre || userData?.email?.split("@")[0] || "Usuario";
  const displayEmail = userData?.email || "Correo no disponible";
  const displayContact = userData?.contacto || "No configurado";
  const displayMunicipio = userData?.municipio || "Ciudad no disponible";
  const isEmpresa = userData?.tipo === "EMPRESA" || (
    !userData?.tipo &&
    Boolean(userData?.id_empresa)
  );
  const tipoUsuario = userData?.es_admin
    ? "Administrador"
    : isEmpresa
    ? userData?.id_rol === 1
      ? "Empresa: Generador"
      : "Empresa: Transformador"
    : userData?.id_rol === 3
      ? "Persona: Reciclador"
      : "Persona: Transformador";

  return (
    <div className="mt-8 mx-auto max-w-6xl pb-16 px-4 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-ink-900 sm:text-4xl">Mi Perfil</h1>
          <p className="mt-2 text-lg text-ink-500">Gestiona tus datos, publicaciones e historial de interesados.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-[#23ce6b] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#1fb85f] transition-all cursor-pointer hover:shadow-md"
        >
          <img src={inlineSvg17} width="16" height="16" alt="" className="brightness-0 invert" />
          <span>Editar perfil</span>
        </button>
      </div>

      {deleteError && (
        <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {deleteError}
        </div>
      )}

      <div className="grid w-full gap-4 lg:grid-cols-2">
        {/* Tarjeta de informacion del perfil */}
        <section className="w-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-surface-200">
          <div className="flex items-center gap-5 border-b border-surface-100 pb-5">
            {/* Foto de perfil interactiva */}
            <div className="relative group shrink-0">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full overflow-hidden bg-[#dff4ed] text-3xl font-extrabold text-[#00805b] shadow-inner ring-2 ring-[#23ce6b]/40">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}

                {/* Spinner de carga al subir foto */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-ink-900/60 flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>

              {/* Boton flotante de camara para actualizar foto */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                title="Cambiar foto de perfil"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#23ce6b] text-white shadow-md hover:bg-[#1fb85f] transition-all hover:scale-110 cursor-pointer border-2 border-white"
              >
                <img src={inlineSvgPhoto} width="13" height="13" alt="" className="brightness-0 invert" />
              </button>

              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarFileSelect}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="my-0.5 text-2xl font-bold text-ink-900 truncate">{displayName}</h2>
              </div>
              <span className="inline-flex items-center rounded-full bg-surface-100 px-3 py-1 text-xs font-bold text-ink-700 mt-1">
                {tipoUsuario}
              </span>
            </div>
          </div>

          <dl className="mt-4 space-y-2.5 text-sm text-ink-600">
            <div>
              <dt className="inline font-bold text-ink-800">Correo: </dt>
              <dd className="inline">{displayEmail}</dd>
            </div>
            <div>
              <dt className="inline font-bold text-ink-800">
                {isEmpresa ? "NIT: " : "Cédula: "}
              </dt>
              <dd className="inline font-mono">{isEmpresa ? (userData?.nit || "No registrado") : (userData?.cedula || "No registrada")}</dd>
            </div>
            {isEmpresa && (
              <div>
                <dt className="inline font-bold text-ink-800">Medio de contacto: </dt>
                <dd className="inline">{displayContact}</dd>
              </div>
            )}
            <div>
              <dt className="inline font-bold text-ink-800">Municipio: </dt>
              <dd className="inline">{displayMunicipio}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-surface-100 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-2xl bg-ink-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-signal-error hover:text-white focus:outline-none focus:ring-2 focus:ring-surface-300 cursor-pointer"
              >
                <img src={inlineSvg15} width="16" height="16" alt="" className="brightness-0 invert" />
                <span>Cerrar sesión</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setIsDeleteAccountModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
                title="Eliminar cuenta"
              >
                <img src={inlineSvg18} width="16" height="16" alt="" className="brightness-0 invert" />
                <span>Eliminar cuenta</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tarjeta de resumen de estadisticas (sin matching) */}
        {isEmpresa && (
          <section className="w-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-surface-200">
            <h2 className="text-2xl font-bold text-ink-800">Resumen</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
              <div className="rounded-2xl bg-surface-50 p-4 border border-surface-100">
                <strong className="block text-3xl font-extrabold text-ink-900">
                  {publicaciones.length}
                </strong>
                <span className="text-xs font-bold text-ink-500 uppercase tracking-wider mt-1 block">Publicaciones</span>
              </div>
              <div className="rounded-2xl bg-surface-50 p-4 border border-surface-100">
                <strong className="block text-3xl font-extrabold text-[#00805b]">
                  {interesados.length}
                </strong>
                <span className="text-xs font-bold text-ink-500 uppercase tracking-wider mt-1 block">Interesados</span>
              </div>
              <div className="rounded-2xl bg-surface-50 p-4 border border-surface-100">
                <strong className="block text-3xl font-extrabold text-ink-900">
                  {totalKg >= 1000 ? `${(totalKg / 1000).toFixed(1)} t` : `${totalKg} kg`}
                </strong>
                <span className="text-xs font-bold text-ink-500 uppercase tracking-wider mt-1 block">Volumen registrado</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Contenido segun el tipo de usuario */}
      {!isEmpresa ? (
        <section className="mt-8 rounded-3xl border border-surface-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-48 w-48 items-center justify-center text-3xl">
            <img src={inlineSvg19} width="200" height="200" alt="" />
          </div>
          <h2 className="mt-2 text-3xl font-bold text-ink-900">Perfil de Persona Natural</h2>
          <p className="mt-4 text-[17px] text-ink-600 max-w-lg mx-auto">
            Tu cuenta está registrada como persona natural. Puedes explorar el catálogo
            de subproductos y manifestar interés en los materiales publicados por las empresas.
          </p>
          <div className="mt-8">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#23ce6b] px-6 py-3 text-lg font-bold text-white shadow hover:bg-[#1fb85f]"
            >
              Explorar el catálogo →
            </Link>
          </div>
        </section>
      ) : (
        /* Panel de empresa con pestañas: Mis publicaciones e Interesados (sin matching) */
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-surface-200">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-surface-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("publicaciones")}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === "publicaciones"
                    ? "bg-[#23ce6b] text-white shadow-sm"
                    : "text-ink-600 hover:bg-surface-100"
                }`}
              >
                Mis publicaciones ({publicaciones.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("interesados")}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "interesados"
                    ? "bg-[#23ce6b] text-white shadow-sm"
                    : "text-ink-600 hover:bg-surface-100"
                }`}
              >
                Interesados en tus publicaciones
                {interesados.length > 0 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-extrabold text-forest-800">
                    {interesados.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="py-12 text-center text-lg text-ink-500">Cargando...</p>
          ) : activeTab === "publicaciones" ? (
            publicaciones.length === 0 ? (
              <div className="py-12 text-center text-ink-500">
                <p className="text-lg">No has registrado ningún subproducto todavía.</p>
                <Link
                  to="/post-subproduct"
                  className="mt-4 inline-block rounded-2xl bg-[#23ce6b] px-6 py-3 text-sm font-bold text-white hover:bg-[#1fb85f]"
                >
                  Publicar mi primer material
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-surface-200 text-xs font-bold uppercase tracking-wider text-ink-500">
                    <tr>
                      <th className="px-3 py-3">Material</th>
                      <th className="px-3 py-3">Estado</th>
                      <th className="px-3 py-3">Volumen</th>
                      <th className="px-3 py-3">Municipio</th>
                      <th className="px-3 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {publicaciones.map((pub) => (
                      <tr key={pub.id} className="hover:bg-surface-50 transition-colors">
                        <td className="px-3 py-3 font-bold text-ink-900">
                          {pub.nombre}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                              pub.id_estado_publicacion === 2
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {pub.id_estado_publicacion === 2 ? "Publicado" : "Borrador"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-ink-700">
                          {pub.volumen_disponible} {pub.unidad_volumen}
                        </td>
                        <td className="px-3 py-3 text-ink-700">{pub.municipio}</td>
                        <td className="px-3 py-3 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {pub.id_estado_publicacion === 2 && (
                              <Link
                                to={`/catalog/${pub.id}`}
                                className="inline-flex items-center gap-1 rounded-xl border border-surface-200 bg-white px-2.5 py-1.5 text-xs font-bold text-ink-700 shadow-sm hover:bg-surface-100"
                              >
                                <img src={inlineSvg16} width="12" height="12" alt="" />
                                Ver
                              </Link>
                            )}
                            <Link
                              to={`/subproduct/${pub.id}/edit`}
                              className="inline-flex items-center gap-1 rounded-xl border border-[#a1d9be] bg-[#dff4ed] px-2.5 py-1.5 text-xs font-bold text-[#00805b] shadow-sm hover:bg-[#c6ebd9]"
                            >
                              <img src={inlineSvg17} width="12" height="12" alt="" />
                              Editar
                            </Link>
                            <HoldButton
                              onHold={() => handleDeleteSubproducto(pub.id)}
                              className="gap-1 rounded-xl text-xs"
                              title="Mantén presionado para eliminar la publicación"
                            >
                              <img src={inlineSvg18} width="12" height="12" alt="" />
                              Eliminar
                            </HoldButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* Sección de interesados */
            interesados.length === 0 ? (
              <div className="py-12 text-center text-ink-500">
                <h3 className="mt-3 text-lg font-bold text-ink-700">Aún no hay interesados</h3>
                <p className="mt-1 text-lg text-ink-700">
                  Cuando otras empresas o recicladores manifiesten interés en tus materiales, aparecerán listados aquí.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-surface-200 text-xs font-bold uppercase tracking-wider text-ink-500">
                    <tr>
                      <th className="px-3 py-3">Fecha</th>
                      <th className="px-3 py-3">Publicación</th>
                      <th className="px-3 py-3">Interesado</th>
                      <th className="px-3 py-3">Correo</th>
                      <th className="px-3 py-3">Tipo de cuenta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {interesados.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                        <td className="px-3 py-3 text-xs text-ink-500">
                          {new Date(item.fecha).toLocaleDateString("es-CO", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-3 py-3 font-bold text-ink-900">
                          {item.publicacion?.nombre || "Material"}
                        </td>
                        <td className="px-3 py-3 font-semibold text-forest-800">
                          {item.interesado?.nombre || "Usuario"}
                        </td>
                        <td className="px-3 py-3 text-ink-700 font-mono text-xs">
                          {item.interesado?.email || "Sin correo"}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center rounded-full bg-surface-100 px-2.5 py-1 text-xs font-bold text-ink-700">
                            {item.interesado?.tipo || "General"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </section>
      )}

      {/* Modal para editar datos de perfil */}
      {userData && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userData={userData}
          onSuccess={handleProfileUpdateSuccess}
        />
      )}

      {/* Modal de confirmación para eliminar cuenta */}
      <AnimatePresence>
        {isDeleteAccountModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-sm px-4"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isDeletingAccount) {
                setIsDeleteAccountModalOpen(false);
              }
            }}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl border border-surface-200 bg-white p-6 sm:p-8 text-center shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-title"
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: "spring", stiffness: 380, damping: 25 }}
            >
              {/* Ícono de alerta */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h2 id="delete-account-title" className="text-2xl font-extrabold text-ink-900">
                ¿Eliminar tu cuenta?
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Esta acción es <strong className="text-red-700">permanente e irreversible</strong>. Se eliminarán tus datos de perfil, todas tus publicaciones y el historial asociado a esta cuenta.
              </p>

              {deleteError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {deleteError}
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteAccountModalOpen(false)}
                  disabled={isDeletingAccount}
                  className="w-full sm:w-auto flex-1 rounded-2xl border border-surface-300 bg-white px-5 py-3 text-sm font-bold text-ink-700 hover:bg-surface-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteAccount}
                  disabled={isDeletingAccount}
                  className="w-full sm:w-auto flex-1 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeletingAccount ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <span>Sí, eliminar cuenta</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
