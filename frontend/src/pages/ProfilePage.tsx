// Pagina de perfil del usuario

import { useEffect, useState } from "react";
import inlineSvg15 from "@/img/logout.svg";
import inlineSvg16 from "@/img/password-view.svg";
import inlineSvg17 from "@/img/edit.svg";
import inlineSvg18 from "@/img/delete.svg";
import { Link, useNavigate } from "react-router-dom";
import { getMisPublicaciones, getCatalogo, eliminarSubproducto } from "@/api/client";
import type { SubproductoCatalogo, SubproductoDetalle } from "@/types";
import HoldButton from "@/components/ui/HoldButton";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState<SubproductoDetalle[]>([]);
  const [catalogo, setCatalogo] = useState<SubproductoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    id?: number;
    email?: string;
    nombre?: string;
    id_empresa?: string | number;
    tipo?: string;
    medio_contacto?: string;
    municipio?: string;
  } | null>(null);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/login", { replace: true });
      return;
    }

    let companyId: string | undefined = undefined;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserData(parsed);
        if (parsed.id_empresa) {
          companyId = String(parsed.id_empresa);
        }
      } catch {
        // Ignorar error de parseo
      }
    }

    const pubsPromise: Promise<SubproductoDetalle[]> = companyId
      ? getMisPublicaciones(companyId)
      : Promise.resolve([]);

    Promise.all([pubsPromise, getCatalogo()])
      .then(([misPubs, cat]) => {
        setPublicaciones(misPubs);
        setCatalogo(cat);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Cerrar sesion limpiando los datos locales
  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    navigate("/catalog");
  }

  // Eliminar un subproducto propio
  async function handleDeleteSubproducto(id: string) {
    try {
      const companyId = userData?.id_empresa;
      if (!companyId) throw new Error("No se encontró la empresa propietaria.");
      await eliminarSubproducto(id, companyId);
      window.setTimeout(() => {
        setPublicaciones((prev) => prev.filter((p) => p.id !== id));
      }, 900);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar el subproducto.");
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
    0,
  );

  const totalMatches = publicaciones.reduce(
    (acc, p) => acc + getMatchesForSubproducto(p),
    0
  );

  const displayName = userData?.nombre || userData?.email?.split("@")[0] || "Usuario";
  const displayEmail = userData?.email || "Correo no disponible";
  const displayContact = userData?.medio_contacto || "Contacto no disponible";
  const displayMunicipio = userData?.municipio || "Ciudad no disponible";

  return (
    <div className="mt-8 mx-auto max-w-6xl pb-16">
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-ink-900 sm:text-4xl">Mi Perfil</h1>
        <p className="mt-2 text-lg text-ink-500">Gestiona publicaciones, contactos e historial.</p>
      </div>

      <div className="grid w-full gap-3 lg:grid-cols-2">
        {/* Tarjeta de informacion del perfil */}
        <section className="w-full rounded-3xl bg-white p-5 shadow-sm ring-1 ring-surface-200">
          <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dff4ed] font-bold text-[#00805b]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="my-2 text-3xl font-bold text-ink-900">{displayName}</h2>
              <p className="text-sm font-semibold text-ink-700">
                {userData?.tipo
                  ? `Empresa de tipo: ${userData.tipo} `
                  : "Tipo de perfil no disponible "}
              </p>
            </div>
          </div>
          <dl className="mt-3 space-y-2 text-sm text-ink-500">
            
            <div><dt className="inline font-bold text-ink-700">Correo: </dt><dd className="inline">{displayEmail}</dd></div>
            <div><dt className="inline font-bold text-ink-700">Contacto: </dt><dd className="inline">{displayContact}</dd></div>
            <div><dt className="inline font-bold text-ink-700">Ciudad: </dt><dd className="inline">{displayMunicipio}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-2xl border border-surface-200 bg-ink-700 px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-signal-error hover:text-white hover:border-signal-error"
            >
              <img src={inlineSvg15} width={"14"} height={"14"} alt="" />
              <span className="text-sm">Cerrar sesión</span>
            </button>
           
          </div>
        </section>

        {/* Tarjeta de resumen de estadisticas */}
        <section className="w-full rounded-3xl bg-white p-5 shadow-sm ring-1 ring-surface-200">
          <h2 className="text-3xl font-bold text-ink-700">Resumen</h2>
          <div className="mt-3 grid grid-cols-2 gap-y-4">
            <div><strong className="block text-3xl text-ink-900">{userData && !userData.id_empresa ? "0" : publicaciones.length}</strong><span className="text-lg text-ink-500">Publicaciones</span></div>
            <div><strong className="block text-3xl text-ink-900">{totalMatches}</strong><span className="text-lg text-ink-500">Matches</span></div>
            <div><strong className="block text-3xl text-ink-900">{publicaciones.length > 0 ? publicaciones.length * 2 : 0}</strong><span className="text-lg text-ink-500">Contactos</span></div>
            <div><strong className="block text-3xl text-ink-900">{userData && !userData.id_empresa ? "0 kg" : (totalKg >= 1000 ? `${(totalKg / 1000).toFixed(1)} t` : `${totalKg} kg`)}</strong><span className="text-lg text-ink-500">Material publicado</span></div>
          </div>
        </section>

      </div>

      {/* Contenido segun el tipo de usuario: persona o empresa */}
      {userData && !userData.id_empresa ? (
        <section className="">
          
        </section>
      ) : (
        /* Tabla de publicaciones de la empresa */
        <section className="mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-surface-200">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-ink-900">Mis publicaciones</h2>
          
          </div>

          {loading ? (
            <p className="py-8 text-center text-lg text-ink-500">Cargando publicaciones...</p>
          ) : publicaciones.length === 0 ? (
            <div className="py-12 text-center text-ink-500">
              <p className="text-lg">No has publicado ningún subproducto todavía.</p>
              <Link
                to="/post-subproduct"
                className="mt-3 inline-block rounded-3xl bg-[#23ce6b] px-4 py-4 text-sm font-bold text-white hover:bg-[#1fb85f]"
              >
                Publicar mi primer material
              </Link>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="border-b border-surface-200 text-ink-700">
                <tr>
                  <th className="px-3 py-2.5 font-bold text-lg">Material</th>
                  <th className="px-3 py-2.5 font-bold text-lg">Cantidad</th>
                  <th className="px-5 py-2.5 font-bold text-lg">Estado</th>
                  <th className="px-8 py-2.5 font-bold text-lg">Matches</th>
                  <th className="px-20 py-2.5 text-right font-bold text-lg">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {publicaciones.map((publicacion) => {
                  const matchCount = getMatchesForSubproducto(publicacion);
                  return (
                    <tr key={publicacion.id} className="border-b border-surface-100 text-ink-600 hover:bg-surface-50 transition-colors">
                      <td className="px-3 py-3">
                        <span className="block font-semibold text-ink-900 text-lg">{publicacion.nombre}</span>
                        <span className="mt-1 inline-block rounded-md bg-surface-100 px-2 py-0.5 text-xs font-medium text-ink-700">
                          {publicacion.familia}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-[16px]">{publicacion.volumen_disponible} {publicacion.unidad_volumen}</td>
                      <td className="px-3 py-5">
                        {(() => {
                          const estado = publicacion.id_estado_publicacion !== 2
                            ? {
                                label: "Borrador",
                                classes: "text-smbg-surface-200 text-ink-700 border-surface-400",
                                dot: "bg-ink-500",
                              }
                            : publicacion.disponible === false
                              ? {
                                  label: "Sin stock",
                                  classes: "text-smbg-amber-100 text-amber-800 border-amber-300",
                                  dot: "bg-amber-600",
                                }
                              : {
                                  label: "Activo",
                                  classes: "text-sm bg-blue-100 text-blue-800 border-blue-300",
                                  dot: "bg-blue-600",
                                };

                          return (
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${estado.classes}`}>
                              <span className={`h-2 w-2 rounded-full ${estado.dot}`} />
                              <span>{estado.label}</span>
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold ${
                          matchCount > 0 ? "bg-[#dff4ed] text-[#00805b]" : "bg-surface-100 text-ink-400"
                        }`}>
                          ↔ {matchCount} {matchCount === 1 ? "coincidencia" : "coincidencias"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {publicacion.id_estado_publicacion === 2 ? (
                            <Link
                              to={`/catalog/${publicacion.id}`}
                              className="inline-flex items-center gap-1 rounded-2xl border border-surface-200 bg-white px-3 py-2 text-sm font-bold text-ink-700 shadow-2xs hover:bg-surface-100 transition-colors"
                              title="Ver publicación en catálogo"
                            >
                              <img src={inlineSvg16} width={"14"} height={"14"} alt="" />
                              Ver
                            </Link>
                          ) : (
                            <span>
                            </span>
                          )}
                          <Link
                            to={`/subproduct/${publicacion.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-2xl border border-[#a1d9be] bg-[#dff4ed] px-3 py-2 text-xs font-bold text-[#00805b] shadow-2xs hover:bg-[#c6ebd9] transition-colors"
                            title="Editar publicación"
                          >
                            <img src={inlineSvg17} width={"14"} height={"14"} alt="" />
                            Editar
                          </Link>
                          <HoldButton
                            onHold={() => handleDeleteSubproducto(publicacion.id)}
                            className="gap-1 rounded-2xl"
                            title="Mantén presionado para eliminar la publicación"
                          >
                            <img src={inlineSvg18} width={"14"} height={"14"} alt="" />
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
        )}
      </section>
      )}

     
    </div>
  );
}
