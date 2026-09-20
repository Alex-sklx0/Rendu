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

# Si no existe la rama base en local, buscar fallback
if ! git show-ref --verify --quiet "refs/heads/$BASE_BRANCH"; then
  BASE_BRANCH="main"
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
  "feature/hu-13-16-backend-busqueda-filtros"
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
echo "🚀 [1/11] Creando ${BRANCHES[0]}..."
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
  backend/src/controllers/personas.controller.js \
  backend/src/routes/personas.routes.js \
  backend/src/routes/index.js \
  backend/API_backend_sprint1.md \
  frontend/src/pages/LoginPage.tsx \
  frontend/src/pages/RegistroPersonaPage.tsx \
  frontend/src/pages/PersonRegistrationPage.tsx \
  frontend/src/lib/constants.ts \
  frontend/src/types/index.ts 2>/dev/null || true
git rm -r --cached scripts 2>/dev/null || true
git add -A
git commit -m "feat(HU-01): registrar, autenticar y gestionar usuarios y personas con Supabase

- Backend: endpoints de registro, login, personas controller/routes y eliminacion de cuenta en usuarios.controller.js y personas.controller.js.
- Frontend: conexion de LoginPage y RegistroPersonaPage con selector de municipio y registro en tabla personas y empresas.
- Resolucion dinamica de actores y compatibilidad con esquema PostgreSQL (roles, personas, usuarios)." || true

# ── HU-02: Registrar empresa ──────────────────────────────────────────────
echo
echo "🚀 [2/11] Creando ${BRANCHES[1]}..."
git checkout -B "${BRANCHES[1]}"
git checkout "$TEMP_SNAPSHOT" -- \
  backend/src/controllers/empresas.controller.js \
  backend/src/routes/empresas.routes.js \
  frontend/src/pages/RegistroEmpresaPage.tsx \
  frontend/src/pages/CompanyRegistrationPage.tsx 2>/dev/null || true
git rm -r --cached scripts 2>/dev/null || true
git add -A
git commit -m "feat(HU-02): registrar y vincular empresas con selector de municipio y validacion de NIT

- Backend: empresas.controller.js (control de duplicados por NIT estandarizado) y empresas.routes.js para registro y consulta de empresa vinculada al usuario.
- Frontend: RegistroEmpresaPage / CompanyRegistrationPage con selector desplegable de municipios del Valle de Aburra y rol empresarial." || true

# ── HU-03 a HU-06: Subproductos, clasificacion, volumen y ubicacion ───────
echo
echo "🚀 [3/11] Creando ${BRANCHES[2]}..."
git checkout -B "${BRANCHES[2]}"
git checkout "$TEMP_SNAPSHOT" -- \
  backend/src/controllers/subproductos.controller.js \
  backend/src/routes/subproductos.routes.js \
  frontend/src/pages/PostSubproductPage.tsx \
  frontend/src/pages/RegisterSubproductPage.tsx 2>/dev/null || true
git rm -r --cached scripts 2>/dev/null || true
git add -A
git commit -m "feat(HU-03-06): registrar, clasificar, medir y ubicar subproductos

- Backend: subproductos.controller.js con resolucion de IDs para familias, unidades y municipios.
- Backend: subproductos.routes.js con rutas POST, GET, PATCH y DELETE.
- Frontend: formulario PostSubproductPage para registro de nuevos subproductos." || true

# ── HU-07: Publicar subproducto ───────────────────────────────────────────
echo
echo "🚀 [4/11] Creando ${BRANCHES[3]}..."
git checkout -B "${BRANCHES[3]}"
git checkout "$TEMP_SNAPSHOT" -- \
  frontend/src/components/layout/AppShell.tsx \
  frontend/src/pages/PostSubproductPage.tsx \
  backend/src/controllers/subproductos.controller.js 2>/dev/null || true
git rm -r --cached scripts 2>/dev/null || true
git add -A
git commit -m "feat(HU-07): publicar subproductos y restriccion de publicacion para personas naturales

- Backend: validacion 403 Forbidden en subproductos.controller.js impidiendo a personas naturales/recicladores publicar subproductos.
- Frontend: ocultamiento del tab '+ Publicar' en AppShell.tsx y pantalla de advertencia en PostSubproductPage.tsx." || true

# ── HU-08: Agregar fotografia al subproducto ──────────────────────────────
echo
echo "🚀 [5/11] Creando ${BRANCHES[4]}..."
git checkout -B "${BRANCHES[4]}"
git checkout "$TEMP_SNAPSHOT" -- \
  backend/src/services/storage.service.js \
  backend/src/controllers/subproductos.controller.js \
  backend/src/routes/subproductos.routes.js 2>/dev/null || true
git rm -r --cached scripts 2>/dev/null || true
git add -A
git commit -m "feat(HU-08): asociar y procesar fotografias con Supabase Storage

- Backend: servicio storage.service.js para subida a bucket 'Imagenes', obtencion de URL publica y endpoint POST /api/subproductos/upload.
- Soporte de procesamiento de Base64 / Buffers y sanitizacion de URLs." || true

# ── HU-09: Consultar catalogo ─────────────────────────────────────────────
echo
echo "🚀 [6/11] Creando ${BRANCHES[5]}..."
git checkout -B "${BRANCHES[5]}"
git checkout "$TEMP_SNAPSHOT" -- \
  backend/src/controllers/catalogo.controller.js \
  backend/src/routes/catalogo.routes.js \
  frontend/src/components/ui/SubproductCard.tsx 2>/dev/null || true
git rm -r --cached scripts 2>/dev/null || true
git add -A
git commit -m "feat(HU-09): consultar catalogo de subproductos desde Supabase

- Backend: catalogo.controller.js con filtros por busqueda, familia y municipio.
- Frontend: SubproductCard con soporte para badge de stock y badges informativos." || true

# ── HU-10: Consultar detalle ──────────────────────────────────────────────
echo
echo "🚀 [7/11] Creando ${BRANCHES[6]}..."
git checkout -B "${BRANCHES[6]}"
git checkout "$TEMP_SNAPSHOT" -- \
  frontend/src/pages/SubproductDetailPage.tsx 2>/dev/null || true
git rm -r --cached scripts 2>/dev/null || true
git add -A
git commit -m "feat(HU-10): consultar informacion detallada del subproducto y empresa

- Frontend: SubproductDetailPage con banner de stock, ficha tecnica, nombre de publicador real y CTA de contacto." || true

# ── HU-11: Actualizar subproducto ─────────────────────────────────────────
echo
echo "🚀 [8/11] Creando ${BRANCHES[7]}..."
git checkout -B "${BRANCHES[7]}"
git checkout "$TEMP_SNAPSHOT" -- \
  frontend/src/pages/UpdateSubproductPage.tsx \
  backend/src/services/storage.service.js \
  backend/src/controllers/subproductos.controller.js 2>/dev/null || true
git rm -r --cached scripts 2>/dev/null || true
git add -A
git commit -m "feat(HU-11): actualizar y eliminar informacion de subproductos e imagenes in-place

- Backend: reemplazo in-place de imagenes en Supabase Storage con deleteStorageFile y actualizacion en actualizarSubproducto con verificacion de propietario (403 Forbidden).
- Frontend: UpdateSubproductPage con modificacion de descripcion, volumen, municipio, switch de disponibilidad y eliminacion." || true

# ── HU-12: Gestionar disponibilidad ───────────────────────────────────────
echo
echo "🚀 [9/11] Creando ${BRANCHES[8]}..."
git checkout -B "${BRANCHES[8]}"
git checkout "$TEMP_SNAPSHOT" -- \
  frontend/src/pages/ProfilePage.tsx 2>/dev/null || true
git rm -r --cached scripts 2>/dev/null || true
git add -A
git commit -m "feat(HU-12): gestionar disponibilidad de subproductos con toggle y vista adaptada a personas

- Frontend: ProfilePage con tarjeta dedicada para usuarios persona (bloqueo de boton de publicar) y tabla con toggle interactivo para empresas." || true

# ── HU-13 a HU-16: Busqueda, Filtros y Coincidencias ──────────────────────
echo
echo "🚀 [10/11] Creando ${BRANCHES[9]}..."
git checkout -B "${BRANCHES[9]}"
git checkout "$TEMP_SNAPSHOT" -- \
  frontend/src/pages/CatalogPage.tsx \
  frontend/src/pages/MatchingPage.tsx 2>/dev/null || true
git rm -r --cached scripts 2>/dev/null || true
git add -A
git commit -m "feat(HU-13-16): busqueda avanzada, filtros combinables por familia y municipio y matching

- Frontend: CatalogPage con busqueda por texto, filtrado por familia y municipio del Valle de Aburra.
- Frontend: MatchingPage vista inicial del modulo de coincidencias." || true

# ── Conexión Final: Frontend + Backend + Supabase ─────────────────────────
echo
echo "🚀 [11/11] Creando ${BRANCHES[10]}..."
git checkout -B "${BRANCHES[10]}"
git checkout "$TEMP_SNAPSHOT" -- .
if [ -f "frontend/src/api/mockClient.ts" ]; then
  git rm -f frontend/src/api/mockClient.ts 2>/dev/null || true
fi
git rm -r --cached scripts 2>/dev/null || true
git add -A
git commit -m "feat(integracion): conectar frontend, backend monolito Express y Supabase sin mocks

- Eliminacion completa de mockClient y capa de persistencia simulada local.
- client.ts conectado 100% a la API REST del backend con soporte de mis-publicaciones por usuario/empresa y registro de personas.
- Perfil con roles dinamicos, exclusion de opciones de publicacion para personas y exclusividad de publicaciones propias.
- Servicio storage.service.js conectado a Supabase Storage con borrado e in-place update.
- Definicion de tipos con campo disponible en types/index.ts.
- Header y navegacion sincronizados en AppShell.tsx." || true

# Limpieza de snapshot temporal
git branch -D "$TEMP_SNAPSHOT"

echo
echo "================================================================="
echo "✅ Todas las ramas e historias de usuario se generaron con éxito."
echo "================================================================="
echo
git log --oneline --decorate --graph -n 16
echo
echo "Rama activa final: $(git branch --show-current)"
