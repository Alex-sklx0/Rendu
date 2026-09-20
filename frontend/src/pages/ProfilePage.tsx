import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMisPublicaciones, getCatalogo, eliminarSubproducto, eliminarCuenta, actualizarSubproducto } from "@/api/client";
import type { SubproductoCatalogo, SubproductoDetalle } from "@/types";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState<SubproductoDetalle[]>([]);
  const [catalogo, setCatalogo] = useState<SubproductoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ id?: number; email?: string; nombre?: string; id_empresa?: string | number } | null>(null);

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

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    navigate("/catalog");
  }

  async function handleDeleteAccount() {
    const confirm = window.confirm(
      "¿Estás seguro de que deseas eliminar tu cuenta?\n\nEsta acción es irreversible y eliminará todos tus datos, empresa y subproductos asociados."
    );
    if (!confirm) return;

    try {
      if (userData?.id) {
        await eliminarCuenta(userData.id);
      }
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar la cuenta.");
    }
  }

  async function handleDeleteSubproducto(id: string, nombre: string) {
    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar el material "${nombre}"?`);
    if (!confirm) return;

    try {
      const companyId = userData?.id_empresa;
      if (!companyId) throw new Error("No se encontró la empresa propietaria.");
      await eliminarSubproducto(id, companyId);
      setPublicaciones((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar el subproducto.");
    }
  }

  async function handleToggleDisponibilidad(publicacion: SubproductoDetalle) {
    const currentDisponibilidad = publicacion.disponible !== false;
    const newDisponibilidad = !currentDisponibilidad;
    setTogglingId(publicacion.id);

    // Actualización optimista en la UI
    setPublicaciones((prev) =>
      prev.map((p) => (p.id === publicacion.id ? { ...p, disponible: newDisponibilidad } : p))
    );

    try {
      const companyId = userData?.id_empresa;
      if (!companyId) throw new Error("No se encontró la empresa propietaria.");
      await actualizarSubproducto(publicacion.id, companyId, { disponible: newDisponibilidad });
    } catch (err) {
      // Revertir en caso de error
      setPublicaciones((prev) =>
        prev.map((p) => (p.id === publicacion.id ? { ...p, disponible: currentDisponibilidad } : p))
      );
      alert(err instanceof Error ? err.message : "Error al actualizar la disponibilidad.");
    } finally {
      setTogglingId(null);
    }
  }


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

  const displayName = userData?.nombre || userData?.email?.split("@")[0] || "Mi perfil";
  const displayEmail = userData?.email || "contacto@fibretex.co";

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{displayName}</h1>
        <p className="mt-1 text-sm text-ink-500">Gestiona publicaciones, contactos e historial.</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.05fr_1.05fr_0.7fr]">
        {/* Profile Info Card */}
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-surface-200">
          <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff4ed] font-bold text-[#00805b]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-ink-900">{displayName}</h2>
              <p className="text-xs text-ink-500">
                {userData && !userData.id_empresa
                  ? "Persona Natural / Reciclador · Valle de Aburrá"
                  : "Empresa Generadora / Transformadora · Valle de Aburrá"}
              </p>
            </div>
          </div>
          <dl className="mt-3 space-y-2 text-xs text-ink-500">
            <div>
              <dt className="inline font-bold text-ink-700">Tipo: </dt>
              <dd className="inline">
                {userData && !userData.id_empresa ? "Persona natural (Reciclador / Gestor)" : "Empresa (Aprovechador / Generador)"}
              </dd>
            </div>
            <div><dt className="inline font-bold text-ink-700">Contacto: </dt><dd className="inline">{displayEmail}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs font-bold text-ink-700 transition-colors hover:bg-surface-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Cerrar sesión</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 hover:border-red-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Eliminar cuenta</span>
            </button>
          </div>
        </section>

        {/* Resumen Stats Card */}
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-surface-200">
          <h2 className="text-xs font-bold text-ink-700">Resumen</h2>
          <div className="mt-3 grid grid-cols-2 gap-y-4">
            <div><strong className="block text-xl text-ink-900">{userData && !userData.id_empresa ? "0" : publicaciones.length}</strong><span className="text-xs text-ink-500">Publicaciones</span></div>
            <div><strong className="block text-xl text-ink-900">{totalMatches}</strong><span className="text-xs text-ink-500">Matches reales</span></div>
            <div><strong className="block text-xl text-ink-900">{publicaciones.length > 0 ? publicaciones.length * 2 : 0}</strong><span className="text-xs text-ink-500">Contactos</span></div>
            <div><strong className="block text-xl text-ink-900">{userData && !userData.id_empresa ? "0 kg" : (totalKg >= 1000 ? `${(totalKg / 1000).toFixed(1)} t` : `${totalKg} kg`)}</strong><span className="text-xs text-ink-500">Material publicado</span></div>
          </div>
        </section>

      </div>

      {/* Section Content: Persona Natural vs Empresa */}
      {userData && !userData.id_empresa ? (
        <section className="mt-4 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-surface-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dff4ed] text-3xl text-[#00805b]">
            👤
          </div>
          <h2 className="mt-4 text-lg font-bold text-ink-900">Perfil de Persona Natural / Reciclador</h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-ink-500 leading-relaxed">
            Como persona natural registrada, tu perfil está habilitado para explorar el catálogo de subproductos y manifestar interés en materiales. La publicación de nuevos subproductos está reservada exclusivamente para empresas.
          </p>
          <div className="mt-6">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-xl bg-[#23ce6b] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#1fb85f]"
            >
              Explorar catálogo de subproductos
            </Link>
          </div>
        </section>
      ) : (
        /* Publications Table for Empresas */
        <section className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-surface-200">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-900">Mis publicaciones</h2>
            
          </div>
          {loading ? (
            <p className="py-8 text-center text-sm text-ink-500">Cargando publicaciones...</p>
          ) : publicaciones.length === 0 ? (
            <div className="py-12 text-center text-ink-500">
              <p className="text-sm">No has publicado ningún subproducto todavía.</p>
              <Link
                to="/post-subproduct"
                className="mt-3 inline-block rounded-xl bg-[#23ce6b] px-5 py-2 text-xs font-bold text-white hover:bg-[#1fb85f]"
              >
                Publicar mi primer material
              </Link>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="border-b border-surface-200 text-ink-700">
                <tr>
                  <th className="px-3 py-2.5 font-bold">Material</th>
                  <th className="px-3 py-2.5 font-bold">Familia</th>
                  <th className="px-3 py-2.5 font-bold">Cantidad</th>
                  <th className="px-3 py-2.5 font-bold">Estado</th>
                  <th className="px-3 py-2.5 font-bold">Matches</th>
                  <th className="px-3 py-2.5 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {publicaciones.map((publicacion) => {
                  const matchCount = getMatchesForSubproducto(publicacion);
                  return (
                    <tr key={publicacion.id} className="border-b border-surface-100 text-ink-600 hover:bg-surface-50">
                      <td className="px-3 py-3 font-semibold text-ink-900">{publicacion.nombre}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-md bg-surface-100 px-2 py-0.5 text-xs font-medium text-ink-700">
                          {publicacion.familia}
                        </span>
                      </td>
                      <td className="px-3 py-3">{publicacion.volumen_disponible} {publicacion.unidad_volumen}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleDisponibilidad(publicacion)}
                          disabled={togglingId === publicacion.id}
                          title={publicacion.disponible !== false ? "Clic para marcar sin stock" : "Clic para marcar disponible"}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                            publicacion.disponible !== false
                              ? "bg-[#dff4ed] text-[#00805b] hover:bg-[#c6ebd9] border border-[#a1d9be]"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                          } disabled:opacity-50`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              publicacion.disponible !== false ? "bg-[#00805b]" : "bg-amber-600 animate-pulse"
                            }`}
                          />
                          <span>{publicacion.disponible !== false ? "Disponible" : "Sin stock"}</span>
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                          matchCount > 0 ? "bg-[#dff4ed] text-[#00805b]" : "bg-surface-100 text-ink-400"
                        }`}>
                          ↔ {matchCount} {matchCount === 1 ? "coincidencia" : "coincidencias"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right space-x-2">
                        <Link
                          to={`/catalog/${publicacion.id}`}
                          className="font-bold text-ink-500 hover:text-ink-800 hover:underline"
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/subproduct/${publicacion.id}/edit`}
                          className="font-bold text-[#00805b] hover:underline"
                        >
                          Editar
                        </Link>
                        
                        <button
                          type="button"
                          onClick={() => handleDeleteSubproducto(publicacion.id, publicacion.nombre)}
                          className="font-bold text-red-500 hover:text-red-700 hover:underline"
                        >
                          Eliminar
                        </button>
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
