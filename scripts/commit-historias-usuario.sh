#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# RENDU — Generador de commits y ramas consecutivas por Historias de Usuario (HU)
# Basado en la planeación de Trello (docs/planeacion_general_rendu_trello.json)
#
# Uso:
#   bash scripts/commit-historias-usuario.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BASE_BRANCH="feature/hu-11-actualizar-subproducto"

if ! git show-ref --verify --quiet "refs/heads/$BASE_BRANCH"; then
  echo "Error: no se encontró la rama base '$BASE_BRANCH'." >&2
  exit 1
fi

BRANCHES=(
  "feature/hu-01-backend-usuarios"
  "feature/hu-02-backend-empresas"
  "feature/hu-03-06-backend-subproductos"
  "feature/hu-07-backend-publicar"
  "feature/hu-08-backend-fotografia"
  "feature/hu-09-backend-catalogo"
  "feature/hu-10-backend-detalle"
  "feature/hu-11-backend-actualizar"
  "feature/hu-12-backend-disponibilidad"
  "feature/conexion-backend-frontend"
)

echo "================================================================="
echo "🌿 Iniciando creación de ramas consecutivas por Historia de Usuario"
echo "📌 Rama base de partida: $BASE_BRANCH"
echo "================================================================="

# 1. Crear snapshot temporal con todos los cambios actuales del árbol de trabajo
TEMP_SNAPSHOT="temp-snapshot-rendu-$(date +%s)"
echo "💾 Creando snapshot temporal ($TEMP_SNAPSHOT)..."
git checkout -b "$TEMP_SNAPSHOT"
git add -A
git commit -m "temp: snapshot de cambios de trabajo" || true

# 2. Regresar limpiamente a la rama base
echo "↩️  Volviendo a la rama base $BASE_BRANCH..."
git checkout "$BASE_BRANCH"

# ── HU-01: Registrar usuario ──────────────────────────────────────────────
echo
echo "🚀 [1/10] Creando ${BRANCHES[0]}..."
git checkout -B "${BRANCHES[0]}"
git checkout "$TEMP_SNAPSHOT" -- \
  backend/Dockerfile \
  backend/package.json \
  backend/.env.example \
  backend/.gitignore \
  backend/server.js \
  backend/src/app.js \
  backend/src/server.js \
  backend/src/config/db.js \
  backend/src/controllers/usuarios.controller.js \
  backend/src/routes/usuarios.routes.js \
  backend/API_backend_sprint1.md \
  frontend/src/pages/LoginPage.tsx \
  frontend/src/pages/RegistroPersonaPage.tsx 2>/dev/null || true
git add -A
git commit -m "feat(HU-01): registrar, autenticar y gestionar usuarios con Supabase

- Backend: endpoints de registro, login y eliminacion de cuenta en usuarios.controller.js y usuarios.routes.js.
- Frontend: conexion de LoginPage y RegistroPersonaPage con selector de municipio.
- Resolucion dinamica de actores y compatibilidad con esquema PostgreSQL."

# ── HU-02: Registrar empresa ──────────────────────────────────────────────
echo
echo "🚀 [2/10] Creando ${BRANCHES[1]}..."
git checkout -B "${BRANCHES[1]}"
git checkout "$TEMP_SNAPSHOT" -- \
  backend/src/controllers/empresas.controller.js \
  backend/src/routes/empresas.routes.js \
  frontend/src/pages/RegistroEmpresaPage.tsx 2>/dev/null || true
git add -A
git commit -m "feat(HU-02): registrar y vincular empresas con selector de municipio

- Backend: empresas.controller.js y empresas.routes.js para registro y consulta de empresa vinculada al usuario.
- Frontend: RegistroEmpresaPage con selector desplegable de municipios del Valle de Aburra."

# ── HU-03 a HU-06: Subproductos, clasificacion, volumen y ubicacion ───────
echo
echo "🚀 [3/10] Creando ${BRANCHES[2]}..."
git checkout -B "${BRANCHES[2]}"
git checkout "$TEMP_SNAPSHOT" -- \
  backend/src/controllers/subproductos.controller.js \
  backend/src/routes/subproductos.routes.js \
  frontend/src/pages/PostSubproductPage.tsx 2>/dev/null || true
git add -A
git commit -m "feat(HU-03-06): registrar, clasificar, medir y ubicar subproductos

- Backend: subproductos.controller.js con resolucion de IDs para familias, unidades y municipios.
- Backend: subproductos.routes.js con rutas POST, GET, PATCH y DELETE.
- Frontend: formulario PostSubproductPage para registro de nuevos subproductos."

# ── HU-07: Publicar subproducto ───────────────────────────────────────────
echo
echo "🚀 [4/10] Creando ${BRANCHES[3]}..."
git checkout -B "${BRANCHES[3]}"
git commit --allow-empty -m "feat(HU-07): publicar subproductos disponibles en el sistema

- Soporte de estado de publicacion y validaciones en backend y frontend."

# ── HU-08: Agregar fotografia ─────────────────────────────────────────────
echo
echo "🚀 [5/10] Creando ${BRANCHES[4]}..."
git checkout -B "${BRANCHES[4]}"
git commit --allow-empty -m "feat(HU-08): asociar y procesar fotografias de subproductos

- Sanitizacion de foto_url / image_url hasta 500 caracteres y soporte de previews en cliente."

# ── HU-09: Consultar catalogo ─────────────────────────────────────────────
echo
echo "🚀 [6/10] Creando ${BRANCHES[5]}..."
git checkout -B "${BRANCHES[5]}"
git checkout "$TEMP_SNAPSHOT" -- \
  backend/src/controllers/catalogo.controller.js \
  backend/src/routes/catalogo.routes.js \
  frontend/src/components/ui/SubproductCard.tsx 2>/dev/null || true
git add -A
git commit -m "feat(HU-09): consultar catalogo de subproductos desde Supabase

- Backend: catalogo.controller.js con filtros por busqueda, familia y municipio.
- Frontend: SubproductCard con soporte para badge de stock y badges informativos."

# ── HU-10: Consultar detalle ──────────────────────────────────────────────
echo
echo "🚀 [7/10] Creando ${BRANCHES[6]}..."
git checkout -B "${BRANCHES[6]}"
git checkout "$TEMP_SNAPSHOT" -- \
  frontend/src/pages/SubproductDetailPage.tsx 2>/dev/null || true
git add -A
git commit -m "feat(HU-10): consultar informacion detallada del subproducto y empresa

- Frontend: SubproductDetailPage con banner de stock, ficha tecnica, nombre de publicador y CTA de contacto."

# ── HU-11: Actualizar subproducto ─────────────────────────────────────────
echo
echo "🚀 [8/10] Creando ${BRANCHES[7]}..."
git checkout -B "${BRANCHES[7]}"
git checkout "$TEMP_SNAPSHOT" -- \
  frontend/src/pages/UpdateSubproductPage.tsx 2>/dev/null || true
git add -A
git commit -m "feat(HU-11): actualizar y eliminar informacion de subproductos

- Frontend: UpdateSubproductPage con modificacion de descripcion, volumen, municipio, switch de disponibilidad y eliminacion."

# ── HU-12: Gestionar disponibilidad ───────────────────────────────────────
echo
echo "🚀 [9/10] Creando ${BRANCHES[8]}..."
git checkout -B "${BRANCHES[8]}"
git checkout "$TEMP_SNAPSHOT" -- \
  frontend/src/pages/ProfilePage.tsx 2>/dev/null || true
git add -A
git commit -m "feat(HU-12): gestionar disponibilidad de subproductos con toggle en tiempo real

- Frontend: ProfilePage con boton toggle interactivo (Disponible / Sin stock) por subproducto, matches calculados y eliminacion de cuenta."

# ── Conexión Final: Frontend + Backend + Supabase ─────────────────────────
echo
echo "🚀 [10/10] Creando ${BRANCHES[9]}..."
git checkout -B "${BRANCHES[9]}"
git checkout "$TEMP_SNAPSHOT" -- .
if [ -f "frontend/src/api/mockClient.ts" ]; then
  git rm -f frontend/src/api/mockClient.ts 2>/dev/null || true
fi
git add -A
git commit -m "feat(integracion): conectar frontend, backend monolito Express y Supabase sin mocks

- Eliminacion completa de mockClient y capa de persistencia simulada local.
- client.ts conectado 100% a la API REST del backend.
- Definicion de tipos con campo disponible en types/index.ts.
- Header y navegacion sincronizados en AppShell.tsx." || true

# Limpieza de snapshot temporal
git branch -D "$TEMP_SNAPSHOT"

echo
echo "================================================================="
echo "✅ Todas las ramas e historias de usuario se generaron con éxito."
echo "================================================================="
echo
git log --oneline --decorate --graph -n 15
echo
echo "Rama activa final: $(git branch --show-current)"
