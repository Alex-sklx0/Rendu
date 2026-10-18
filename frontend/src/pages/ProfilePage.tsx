
import { useEffect, useState } from "react";
import inlineSvg15 from "@/img/logout.svg";
import inlineSvg16 from "@/img/password-view.svg";
import inlineSvg17 from "@/img/edit.svg";
import inlineSvg18 from "@/img/delete.svg";
import inlineSvg19 from "@/img/user-plant-green.svg";
import { Link, useNavigate } from "react-router-dom";
import {
  getMisPublicaciones,
  getCatalogo,
  eliminarSubproducto,
  getInteresados,
  getMe,
  clearSession,
  getToken,
} from "@/api/client";
import type { SubproductoCatalogo, SubproductoDetalle, InteresadoItem } from "@/types";
import HoldButton from "@/components/ui/HoldButton";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState<SubproductoDetalle[]>([]);
  const [interesados, setInteresados] = useState<InteresadoItem[]>([]);
  const [catalogo, setCatalogo] = useState<SubproductoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"publicaciones" | "interesados">("publicaciones");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    id?: number;
    email?: string;
    nombre?: string;
    id_empresa?: string | number | null;
    tipo?: "EMPRESA" | "PERSONA" | null;
    id_rol?: number | null;
    medio_contacto?: string | null;
    municipio?: string | null;
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
          tipo: perfil.tipo,
          id_rol: perfil.empresa?.id_rol ?? perfil.persona?.id_rol ?? null,
          medio_contacto: perfil.empresa?.medio_contacto || null,
          municipio: perfil.empresa?.municipio || perfil.persona?.municipio || null,
        };
        setUserData(u);

        const promises: [Promise<SubproductoDetalle[]>, Promise<SubproductoCatalogo[]>, Promise<any>] = [
          u.id_empresa ? getMisPublicaciones() : Promise.resolve([]),
          getCatalogo(),
          u.id_empresa ? getInteresados().catch(() => ({ total: 0, interesados: [] })) : Promise.resolve({ total: 0, interesados: [] }),
        ];

        return Promise.all(promises);
      })
      .then(([misPubs, cat, resInteresados]) => {
        setPublicaciones(misPubs);
        setCatalogo(cat);
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


  // Cuenta cuantos materiales del catalogo coinciden con la publicacion
  function getMatchesForSubproducto(p: SubproductoDetalle): number {
    return catalogo.filter(
      (c) => (c.id_familia === p.id_familia || c.familia === p.familia) && String(c.id) !== String(p.id)
    ).length;
  }

  const totalKg = publicaciones.reduce(
    (total, publicacion) => total + (publicacion.unidad_volumen === "kg" ? publicacion.volumen_disponible : 0),
    0
  );

  const totalMatches = publicaciones.reduce((acc, p) => acc + getMatchesForSubproducto(p), 0);

  const displayName = userData?.nombre || userData?.email?.split("@")[0] || "Usuario";
  const displayEmail = userData?.email || "Correo no disponible";
  const displayContact = userData?.medio_contacto || "No configurado";
  const displayMunicipio = userData?.municipio || "Ciudad no disponible";
  const isEmpresa = userData?.tipo === "EMPRESA" || (
    !userData?.tipo &&
    Boolean(userData?.id_empresa)
  );
  const tipoUsuario = isEmpresa
    ? userData?.id_rol === 1
      ? "Empresa: Generador"
      : "Empresa: Transformador"
    : userData?.id_rol === 3
      ? "Persona: Reciclador"
      : "Persona: Transformador";

  return (
    <div className="mt-8 mx-auto max-w-6xl pb-16">
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-ink-900 sm:text-4xl">Mi Perfil</h1>
        <p className="mt-2 text-lg text-ink-500">Gestiona publicaciones, interesados e historial.</p>
      </div>

      {deleteError && (
        <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {deleteError}
        </div>
      )}

      <div className="grid w-full gap-4 lg:grid-cols-2">
        {/* Tarjeta de informacion del perfil */}
        <section className="w-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-surface-200">
          <div className="flex items-center gap-4 border-b border-surface-100 pb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dff4ed] text-3xl font-extrabold text-[#00805b]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="my-1 text-2xl font-bold text-ink-900">{displayName}</h2>
              <span className="inline-flex items-center rounded-full bg-surface-100 px-3 py-1 text-xs font-bold text-ink-700">
                {tipoUsuario}
              </span>
            </div>
          </div>
          <dl className="mt-4 space-y-2.5 text-sm text-ink-600">
            <div>
              <dt className="inline font-bold text-ink-800">Correo: </dt>
              <dd className="inline">{displayEmail}</dd>
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
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl bg-ink-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-signal-error hover:text-white focus:outline-none focus:ring-2 focus:ring-surface-300"
            >
              <img src={inlineSvg15} width="16" height="16" alt="" className="brightness-0 invert" />
              <span>Cerrar sesión</span>
            </button>

            
          </div>
        </section>

        {/* Tarjeta de resumen de estadisticas */}
        {isEmpresa && (
        <section className="w-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-surface-200">
          <h2 className="text-2xl font-bold text-ink-800">Resumen</h2>
          <div className="mt-4 grid grid-cols-2 gap-y-6">
            <div>
              <strong className="block text-3xl font-extrabold text-ink-900">
                {!isEmpresa ? "0" : publicaciones.length}
              </strong>
              <span className="text-sm font-medium text-ink-500">Publicaciones</span>
            </div>
            <div>
              <strong className="block text-3xl font-extrabold text-[#00805b]">
                {interesados.length}
              </strong>
              <span className="text-sm font-medium text-ink-500">Interesados</span>
            </div>
            <div>
              <strong className="block text-3xl font-extrabold text-ink-900">{totalMatches}</strong>
              <span className="text-sm font-medium text-ink-500">Coincidencias (Matches)</span>
            </div>
            <div>
              <strong className="block text-3xl font-extrabold text-ink-900">
                {!isEmpresa
                  ? "0 kg"
                  : totalKg >= 1000
                  ? `${(totalKg / 1000).toFixed(1)} t`
                  : `${totalKg} kg`}
              </strong>
              <span className="text-sm font-medium text-ink-500">Volumen registrado</span>
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
          <p className="mt-6 text-[17px]text-ink-600 max-w-lg mx-auto">
            Tu cuenta está registrada como persona natural. Puedes explorar el catálogo
            de subproductos y manifestar interés en los materiales publicados por las empresas.
          </p>
          <div className="mt-10">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#23ce6b] px-6 py-3 text-lg font-bold text-white shadow hover:bg-[#1fb85f]"
            >
              Explorar el catálogo →
            </Link>
          </div>
        </section>
      ) : (
        /* Panel de empresa con pestanas: Mis publicaciones e Interesados*/
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-surface-200">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-surface-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("publicaciones")}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
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
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
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
                      <th className="px-3 py-3">Coincidencias</th>
                      <th className="px-3 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {publicaciones.map((pub) => {
                      const matchCount = getMatchesForSubproducto(pub);
                      return (
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
                          <td className="px-3 py-3 text-ink-600 font-semibold">
                            ↔ {matchCount} {matchCount === 1 ? "match" : "matches"}
                          </td>
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
                      );
                    })}
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
    </div>
  );
}
