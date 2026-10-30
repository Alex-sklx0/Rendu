// Panel de administracion del sistema — solo accesible para usuarios con es_admin: true

import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getToken,
  getAdminUsuarios,
  suspenderUsuario,
  reactivarUsuario,
  getAdminSubproductos,
  despublicarSubproductoAdmin,
  cambiarDisponibilidadAdmin,
  eliminarSubproductoAdmin,
  type AdminUsuario,
  type AdminSubproducto,
} from "@/api/client";
import HoldButton from "@/components/ui/HoldButton";
import { FAMILIAS_MATERIAL } from "@/lib/constants";

// ─── Helpers ───────────────────────────────────────────────────────────────

function familiaNombre(id: number): string {
  return FAMILIAS_MATERIAL.find((f) => Number(f.id) === id)?.nombre ?? `Familia ${id}`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Badge reutilizable ─────────────────────────────────────────────────────

type BadgeColor = "green" | "red" | "amber" | "blue" | "gray";

function Badge({ children, color }: { children: React.ReactNode; color: BadgeColor }) {
  const styles: Record<BadgeColor, string> = {
    green: "bg-[#dff4ed] text-[#00805b] border-[#23ce6b]/30",
    red: "bg-red-100 text-red-800 border-red-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    gray: "bg-surface-100 text-ink-600 border-surface-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${styles[color]}`}>
      {children}
    </span>
  );
}

// ─── Búsqueda ───────────────────────────────────────────────────────────────

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative min-w-0 flex-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Buscar..."}
        className="w-full rounded-2xl border border-surface-300 bg-white py-2.5 pl-9 pr-4 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-forest-600 focus:outline-none"
      />
    </div>
  );
}

// ─── Pestaña Usuarios ───────────────────────────────────────────────────────

type FiltroTipo = "todos" | "empresa" | "persona";
type FiltroEstadoUser = "todos" | "activo" | "suspendido";

function TabUsuarios({ currentAdminId }: { currentAdminId: number }) {
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ id: number; msg: string; ok: boolean } | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoUser>("todos");

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAdminUsuarios()
      .then(({ usuarios }) => setUsuarios(usuarios))
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar usuarios."))
      .finally(() => setLoading(false));
  }, []);

  function notify(id: number, msg: string, ok: boolean) {
    setActionMsg({ id, msg, ok });
    setTimeout(() => setActionMsg(null), 3500);
  }

  async function handleSuspender(id: number) {
    try {
      const updated = await suspenderUsuario(id);
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, suspendido: updated.suspendido } : u)));
      notify(id, "Usuario suspendido correctamente.", true);
    } catch (err) {
      notify(id, err instanceof Error ? err.message : "Error al suspender.", false);
    }
  }

  async function handleReactivar(id: number) {
    try {
      const updated = await reactivarUsuario(id);
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, suspendido: updated.suspendido } : u)));
      notify(id, "Usuario reactivado correctamente.", true);
    } catch (err) {
      notify(id, err instanceof Error ? err.message : "Error al reactivar.", false);
    }
  }

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return usuarios.filter((u) => {
      const matchQ = !q || u.email.toLowerCase().includes(q) || (u.nombre ?? "").toLowerCase().includes(q) || (u.documento ?? "").toLowerCase().includes(q) || (u.municipio ?? "").toLowerCase().includes(q);
      const matchTipo = filtroTipo === "todos" || (filtroTipo === "empresa" && u.tipo === "EMPRESA") || (filtroTipo === "persona" && u.tipo === "PERSONA");
      const matchEstado = filtroEstado === "todos" || (filtroEstado === "activo" && !u.suspendido) || (filtroEstado === "suspendido" && u.suspendido);
      return matchQ && matchTipo && matchEstado;
    });
  }, [usuarios, busqueda, filtroTipo, filtroEstado]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#23ce6b] border-t-transparent" />
        <p className="text-sm text-ink-500">Cargando usuarios...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-800">{error}</div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por email, nombre, NIT o cédula..." />
        <div className="flex gap-2">
          {(["todos", "empresa", "persona"] as FiltroTipo[]).map((f) => (
            <button key={f} type="button" onClick={() => setFiltroTipo(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${filtroTipo === f ? "bg-[#23ce6b] text-white shadow-sm" : "border border-surface-200 bg-white text-ink-600 hover:bg-surface-100"}`}>
              {f === "todos" ? "Todos" : f === "empresa" ? "Empresas" : "Personas"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["todos", "activo", "suspendido"] as FiltroEstadoUser[]).map((f) => (
            <button key={f} type="button" onClick={() => setFiltroEstado(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${filtroEstado === f ? "bg-ink-800 text-white shadow-sm" : "border border-surface-200 bg-white text-ink-600 hover:bg-surface-100"}`}>
              {f === "todos" ? "Todos" : f === "activo" ? "Activos" : "Suspendidos"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs font-medium text-ink-500">
        {filtrados.length} de {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}
      </p>

      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center text-sm text-ink-500">No hay usuarios que coincidan con los filtros.</div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((u) => (
            <div key={u.id} className={`rounded-3xl border bg-white p-5 shadow-sm transition-all ${u.suspendido ? "border-red-200" : "border-surface-200"}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-ink-900 truncate">{u.nombre ?? u.email}</span>
                    {u.es_admin && <Badge color="blue">Administrador</Badge>}
                    {u.suspendido ? <Badge color="red">Suspendido</Badge> : <Badge color="green">Activo</Badge>}
                    {u.tipo && <Badge color={u.tipo === "EMPRESA" ? "blue" : "gray"}>{u.tipo === "EMPRESA" ? "Empresa" : "Persona"}</Badge>}
                  </div>
                  <p className="text-sm text-ink-500 truncate">{u.email}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                    {u.documento && <span><span className="font-semibold text-ink-700">{u.tipo === "EMPRESA" ? "NIT:" : "Cédula:"}</span> {u.documento}</span>}
                    {u.municipio && <span>📍 {u.municipio}</span>}
                    <span><span className="font-semibold text-ink-700">Registro:</span> {formatDate(u.fecha_registro)}</span>
                    <span className="font-mono text-ink-400">ID: {u.id}</span>
                  </div>
                  {actionMsg?.id === u.id && (
                    <p className={`mt-1 text-xs font-semibold ${actionMsg.ok ? "text-[#00805b]" : "text-red-700"}`}>{actionMsg.msg}</p>
                  )}
                </div>
                {!u.es_admin && u.id !== currentAdminId && (
                  <div className="flex shrink-0 items-center gap-2">
                    {u.suspendido ? (
                      <button type="button" onClick={() => handleReactivar(u.id)}
                        className="rounded-2xl bg-[#23ce6b] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1fb85f] transition-colors">
                        ✓ Reactivar
                      </button>
                    ) : (
                      <HoldButton holdTime={1500} doneLabel="Suspendido" onHold={() => handleSuspender(u.id)}
                        className="!rounded-2xl !text-xs !font-bold !px-4 !py-2"
                        title="Mantén presionado para suspender">
                        Suspender
                      </HoldButton>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Pestaña Subproductos ───────────────────────────────────────────────────

type FiltroEstadoPub = "todos" | "borrador" | "publicado";

function TabSubproductos() {
  const [subproductos, setSubproductos] = useState<AdminSubproducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ id: number | string; msg: string; ok: boolean } | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoPub>("todos");
  const [deleted, setDeleted] = useState<Set<number | string>>(new Set());

  function notify(id: number | string, msg: string, ok: boolean) {
    setActionMsg({ id, msg, ok });
    setTimeout(() => setActionMsg(null), 3500);
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAdminSubproductos()
      .then(({ subproductos }) => setSubproductos(subproductos))
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar subproductos."))
      .finally(() => setLoading(false));
  }, []);

  async function handleDespublicar(id: number | string) {
    try {
      const updated = await despublicarSubproductoAdmin(id);
      setSubproductos((prev) => prev.map((s) => s.id === id ? { ...s, id_estado_publicacion: updated.id_estado_publicacion, estado_publicacion: "borrador" as const } : s));
      notify(id, "Publicación despublicada por moderación.", true);
    } catch (err) {
      notify(id, err instanceof Error ? err.message : "Error al despublicar.", false);
    }
  }

  async function handleDisponibilidad(id: number | string, disponible: boolean) {
    try {
      const updated = await cambiarDisponibilidadAdmin(id, disponible);
      setSubproductos((prev) => prev.map((s) => s.id === id ? { ...s, disponible: updated.disponible } : s));
      notify(id, disponible ? "Marcado como disponible." : "Marcado sin stock.", true);
    } catch (err) {
      notify(id, err instanceof Error ? err.message : "Error al cambiar disponibilidad.", false);
    }
  }

  async function handleEliminar(id: number | string) {
    try {
      await eliminarSubproductoAdmin(id);
      setDeleted((prev) => new Set([...prev, id]));
      notify(id, "Subproducto eliminado.", true);
    } catch (err) {
      notify(id, err instanceof Error ? err.message : "Error al eliminar.", false);
    }
  }

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return subproductos.filter((s) => {
      if (deleted.has(s.id)) return false;
      const matchQ = !q || s.nombre.toLowerCase().includes(q) || (s.empresa ?? "").toLowerCase().includes(q) || (s.municipio ?? "").toLowerCase().includes(q) || familiaNombre(s.id_familia_material).toLowerCase().includes(q);
      const matchEstado = filtroEstado === "todos" || (filtroEstado === "publicado" && s.id_estado_publicacion === 2) || (filtroEstado === "borrador" && s.id_estado_publicacion !== 2);
      return matchQ && matchEstado;
    });
  }, [subproductos, busqueda, filtroEstado, deleted]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#23ce6b] border-t-transparent" />
        <p className="text-sm text-ink-500">Cargando subproductos...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-800">{error}</div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, empresa, municipio..." />
        <div className="flex gap-2">
          {(["todos", "publicado", "borrador"] as FiltroEstadoPub[]).map((f) => (
            <button key={f} type="button" onClick={() => setFiltroEstado(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${filtroEstado === f ? "bg-[#23ce6b] text-white shadow-sm" : "border border-surface-200 bg-white text-ink-600 hover:bg-surface-100"}`}>
              {f === "todos" ? "Todos" : f === "publicado" ? "Publicados" : "Borradores"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs font-medium text-ink-500">
        {filtrados.length} de {subproductos.length - deleted.size} subproducto{subproductos.length !== 1 ? "s" : ""}
      </p>

      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center text-sm text-ink-500">No hay subproductos que coincidan con los filtros.</div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((s) => {
            const esPublicado = s.id_estado_publicacion === 2;
            return (
              <div key={s.id} className={`rounded-3xl border bg-white p-5 shadow-sm transition-all ${!s.disponible ? "border-amber-200" : "border-surface-200"}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {s.foto_url && <img src={s.foto_url} alt="" className="h-9 w-9 rounded-xl object-cover border border-surface-200 shrink-0" />}
                      <span className="font-bold text-ink-900">{s.nombre}</span>
                      {esPublicado ? <Badge color="green">Publicado</Badge> : <Badge color="amber">Borrador</Badge>}
                      {s.disponible ? <Badge color="green">Disponible</Badge> : <Badge color="amber">Sin stock</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                      {s.empresa && <span>🏢 {s.empresa}</span>}
                      <span>📦 {familiaNombre(s.id_familia_material)}</span>
                      {s.municipio && <span>📍 {s.municipio}</span>}
                      <span><span className="font-semibold text-ink-700">Vol:</span> {s.volumen_disponible} {s.unidad_volumen ?? ""}</span>
                      <span><span className="font-semibold text-ink-700">Registro:</span> {formatDate(s.fecha_registro)}</span>
                      <span className="font-mono text-ink-400">ID: {s.id}</span>
                    </div>
                    {esPublicado && (
                      <Link to={`/catalog/${s.id}`} className="inline-flex text-xs font-semibold text-forest-700 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">
                        Ver publicación →
                      </Link>
                    )}
                    {actionMsg?.id === s.id && (
                      <p className={`mt-1 text-xs font-semibold ${actionMsg.ok ? "text-[#00805b]" : "text-red-700"}`}>{actionMsg.msg}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {esPublicado && (
                      <button type="button" onClick={() => handleDespublicar(s.id)}
                        className="rounded-2xl border border-amber-200 bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800 shadow-sm hover:bg-amber-200 transition-colors">
                        Despublicar
                      </button>
                    )}
                    <button type="button" onClick={() => handleDisponibilidad(s.id, !s.disponible)}
                      className={`rounded-2xl border px-3 py-2 text-xs font-bold shadow-sm transition-colors ${s.disponible ? "border-surface-200 bg-surface-100 text-ink-700 hover:bg-surface-200" : "border-[#23ce6b]/30 bg-[#dff4ed] text-[#00805b] hover:bg-[#c8edde]"}`}>
                      {s.disponible ? "Sin stock" : "Disponible"}
                    </button>
                    <HoldButton holdTime={2000} doneLabel="Eliminado" onHold={() => handleEliminar(s.id)}
                      className="!rounded-2xl !text-xs !font-bold !px-3 !py-2"
                      title="Mantén 2 segundos para eliminar">
                      Eliminar
                    </HoldButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────

type Tab = "usuarios" | "subproductos";

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("usuarios");
  const [currentAdminId, setCurrentAdminId] = useState<number>(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) { navigate("/login", { replace: true }); return; }
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login", { replace: true }); return; }
    try {
      const user = JSON.parse(stored);
      if (!user.es_admin) { navigate("/catalog", { replace: true }); return; }
      setCurrentAdminId(user.id ?? 0);
      setReady(true);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  if (!ready) return null;

  const tabs: { value: Tab; label: string }[] = [
    { value: "usuarios", label: "Usuarios" },
    { value: "subproductos", label: "Subproductos" },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Panel Administrador
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-forest-900 sm:text-4xl">Panel de Administración</h1>
        <p className="mt-1.5 text-base text-ink-500">Gestión y moderación de usuarios y publicaciones del sistema.</p>
      </div>

      <div className="mb-6 flex w-fit gap-1 rounded-2xl border border-surface-200 bg-surface-100 p-1">
        {tabs.map((tab) => (
          <button key={tab.value} type="button" onClick={() => setActiveTab(tab.value)}
            className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${activeTab === tab.value ? "bg-white text-forest-900 shadow-sm" : "text-ink-500 hover:text-ink-800"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "usuarios" ? <TabUsuarios currentAdminId={currentAdminId} /> : <TabSubproductos />}
    </div>
  );
}
