#!/usr/bin/env bash
# Organiza los cambios del backend y su conexion con el frontend por HU.
# Las ramas se crean de forma consecutiva desde la rama actual.
# Ejecutar desde la raiz:
#   bash scripts/commit-backend-supabase.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BASE_BRANCH="$(git branch --show-current)"
if [[ -z "$BASE_BRANCH" ]]; then
  echo "Error: no se pudo determinar la rama base." >&2
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
  "feature/conexion-backend-frontend"
)

for branch in "${BRANCHES[@]}"; do
  if git show-ref --verify --quiet "refs/heads/$branch"; then
    echo "Error: la rama '$branch' ya existe. No se realizaron operaciones." >&2
    exit 1
  fi
done

commit_paths() {
  local message="$1"
  shift
  git add -A -- "$@"
  if git diff --cached --quiet; then
    echo "Error: no hay cambios para '$message'." >&2
    exit 1
  fi
  git commit -m "$message"
}

commit_empty() {
  git commit --allow-empty -m "$1"
}

echo "Rama base: $BASE_BRANCH"
echo "Creando ${BRANCHES[0]}..."
git checkout -b "${BRANCHES[0]}"
commit_paths "feat(HU-01): conectar registro de usuarios con Supabase" \
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
  backend/API_backend_sprint1.md

echo "Creando ${BRANCHES[1]}..."
git checkout -b "${BRANCHES[1]}"
commit_paths "feat(HU-02): conectar registro de empresas con Supabase" \
  backend/src/controllers/empresas.controller.js \
  backend/src/routes/empresas.routes.js

echo "Creando ${BRANCHES[2]}..."
git checkout -b "${BRANCHES[2]}"
commit_paths "feat(HU-03-06): registrar y relacionar subproductos" \
  backend/src/controllers/subproductos.controller.js \
  backend/src/routes/subproductos.routes.js \
  database/postgres/diagrama_relacional_rendu.png

echo "Creando ${BRANCHES[3]}..."
git checkout -b "${BRANCHES[3]}"
commit_empty "feat(HU-07): publicar subproductos disponibles"

echo "Creando ${BRANCHES[4]}..."
git checkout -b "${BRANCHES[4]}"
commit_empty "feat(HU-08): asociar fotografias a subproductos"

echo "Creando ${BRANCHES[5]}..."
git checkout -b "${BRANCHES[5]}"
commit_paths "feat(HU-09): consultar catalogo desde Supabase" \
  backend/src/controllers/catalogo.controller.js \
  backend/src/routes/catalogo.routes.js

echo "Creando ${BRANCHES[6]}..."
git checkout -b "${BRANCHES[6]}"
commit_empty "feat(HU-10): consultar detalle de subproducto"

echo "Creando ${BRANCHES[7]}..."
git checkout -b "${BRANCHES[7]}"
commit_empty "feat(HU-11): actualizar informacion de subproducto"

echo "Creando ${BRANCHES[8]}..."
git checkout -b "${BRANCHES[8]}"
commit_paths "feat(integracion): conectar frontend, backend y Supabase" \
  .gitignore \
  docker-compose.yml \
  docs/agents/api-contract.md \
  frontend/.env.example \
  frontend/src/api/client.ts \
  scripts/commit-backend-supabase.sh

echo
echo "Cadena creada correctamente:"
git log --oneline --decorate --max-count=14
echo
echo "Rama actual: $(git branch --show-current)"
echo "Rama base original: $BASE_BRANCH"
