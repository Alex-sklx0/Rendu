import { useState, useEffect } from "react";
import { getCatalogo } from "@/api/client";
import type { SubproductoCatalogo } from "@/types";
import { SubproductCard } from "@/components/ui/SubproductCard";
import { FAMILIAS_MATERIAL, MUNICIPIOS_VALLE_ABURRA } from "@/lib/constants";

export default function CatalogPage() {
  const [subproductos, setSubproductos] = useState<SubproductoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFamilias, setActiveFamilias] = useState<string[]>([]);
  const [activeMunicipio, setActiveMunicipio] = useState<string>("todos");

  useEffect(() => {
    async function fetchCatalogo() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCatalogo({
          query: searchQuery,
          id_familia: activeFamilias.length > 0 ? activeFamilias.join(",") : undefined,
          municipio: activeMunicipio !== "todos" ? activeMunicipio : undefined,
        });
        setSubproductos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar catálogo.");
      } finally {
        setLoading(false);
      }
    }

    fetchCatalogo();
  }, [searchQuery, activeFamilias, activeMunicipio]);

  function handleToggleFamilia(id: string) {
    setActiveFamilias((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <div className="mx-auto max-w-6xl pb-16">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-forest-900 sm:text-4xl">
          Catálogo de materiales
        </h1>
        <p className="mt-2 text-base text-ink-500">
          Encuentra subproductos disponibles cerca de tu empresa.
        </p>
      </div>

      {/* barra de busqueda */}
      <div className="mb-6 flex flex-col gap-8 sm:flex-row ">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar material, empresa o sector..."
            className="w-full rounded-2xl border border-surface-300 bg-white py-3.5 pl-11 pr-4 text-ink-900 shadow-sm transition-colors placeholder:text-ink-500 focus:border-forest-600 focus:outline-none"
          />
        </div>

        {/* filtro de municipios */}
        <select
          value={activeMunicipio}
          onChange={(e) => setActiveMunicipio(e.target.value)}
          className="rounded-2xl border border-surface-200 bg-white px-4 py-3.5 text-sm font-medium text-ink-700 shadow-sm focus:border-forest-600 focus:outline-none"
        >
          <option value="todos">Todos los municipios</option>
          {MUNICIPIOS_VALLE_ABURRA.map((mun) => (
            <option key={mun} value={mun}>
              {mun}
            </option>
          ))}
        </select>
      </div>

      {/* filtro de categorías (selección múltiple) */}
      <div className="mb-8 flex flex-wrap gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveFamilias([])}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
            activeFamilias.length === 0
              ? "bg-[#23ce6b] text-white shadow-sm"
              : "border border-surface-200 bg-white text-ink-600 hover:bg-surface-100"
          }`}
        >
          Todos {activeFamilias.length === 0 ? "" : `(${activeFamilias.length} seleccionados)`}
        </button>
        {FAMILIAS_MATERIAL.map((fam) => {
          const isActive = activeFamilias.includes(fam.id);
          return (
            <button
              key={fam.id}
              type="button"
              onClick={() => handleToggleFamilia(fam.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#23ce6b] text-white shadow-sm"
                  : "border border-surface-200 bg-white text-ink-600 hover:bg-surface-100"
              }`}
            >
              {isActive ? "✓ " : ""}{fam.nombre}
            </button>
          );
        })}
      </div>

      {/* malla de subproductos */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-600 border-t-transparent" />
            <p className="text-sm font-medium text-ink-500">Cargando subproductos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-semibold">Ocurrió un error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : subproductos.length === 0 ? (
        <div className="rounded-2xl p-12 text-center ">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full  text-3xl">
            🔍
          </div>
          <h3 className="mt-4 text-lg font-bold text-ink-900">
            No se encontraron materiales
          </h3>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveFamilias([]);
              setActiveMunicipio("todos");
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-semibold text-forest-700 hover:bg-surface-50"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subproductos.map((item) => (
            <SubproductCard key={item.id} subproducto={item} />
          ))}
        </div>
      )}
    </div>
  );
}
