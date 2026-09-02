import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">
          Mercado digital de subproductos industriales
        </h1>
        <p className="mt-2 text-ink-500">
          Conecta empresas del Valle de Aburrá para dar una segunda vida a materiales que hoy
          terminan como residuo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/registro/usuario" className="card hover:border-forest-600 transition-colors">
          <h2 className="font-medium text-ink-900">1. Crear cuenta</h2>
          <p className="mt-1 text-sm text-ink-500">Regístrate para empezar.</p>
        </Link>
        <Link to="/registro/empresa" className="card hover:border-forest-600 transition-colors">
          <h2 className="font-medium text-ink-900">2. Registrar empresa</h2>
          <p className="mt-1 text-sm text-ink-500">Cuéntanos qué tipo de organización eres.</p>
        </Link>
        <Link to="/subproductos/nuevo" className="card hover:border-forest-600 transition-colors">
          <h2 className="font-medium text-ink-900">3. Publicar subproducto</h2>
          <p className="mt-1 text-sm text-ink-500">Registra el material que quieres ofrecer.</p>
        </Link>
      </div>
    </div>
  );
}
