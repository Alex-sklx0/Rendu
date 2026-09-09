#!/usr/bin/env bash
# Actualiza las ramas de los dos primeros sprints con los cambios pendientes.
# Ejecutar desde la raiz del repositorio:
#   bash scripts/commit-sprint-2.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BASE_BRANCH="feature/hu-01-02-03-registro-ui"
BRANCH_HU07="feature/hu-07-publicar-subproducto"
BRANCH_HU08="feature/hu-08-fotografia-subproducto"
BRANCH_HU09="feature/hu-09-catalogo-subproductos"
BRANCH_HU10="feature/hu-10-detalle-subproducto"
BRANCH_HU11="feature/hu-11-actualizar-subproducto"

for branch in "$BASE_BRANCH" "$BRANCH_HU07" "$BRANCH_HU08" "$BRANCH_HU09" "$BRANCH_HU10" "$BRANCH_HU11"; do
  git show-ref --verify --quiet "refs/heads/$branch" || {
    echo "Error: no existe la rama '$branch'." >&2
    exit 1
  }
done

if [[ "$(git branch --show-current)" != "$BRANCH_HU11" ]]; then
  echo "Error: ejecuta el script desde '$BRANCH_HU11' para conservar los cambios actuales." >&2
  exit 1
fi

commit_paths() {
  local message="$1"
  shift
  git add -A -- "$@"
  if git diff --cached --quiet; then
    echo "Error: no hay cambios preparados para: $message" >&2
    exit 1
  fi
  git commit -m "$message"
}

# Primero se confirma el ajuste común que sí existe en la rama base.
commit_paths "chore(HU-01-03): actualizar identidad y pantallas compartidas" \
  .gitignore \
  frontend/src/components/layout/AppShell.tsx \
  frontend/src/components/ui/Banner.tsx \
  frontend/src/components/ui/RenduLogo.tsx \
  frontend/src/index.css \
  frontend/src/pages/HomePage.tsx \
  frontend/src/pages/Splash1Page.tsx \
  frontend/src/pages/Splash2Page.tsx \
  frontend/src/pages/Splash3Page.tsx \
  frontend/src/pages/SplashPage.tsx

# El resto queda temporalmente guardado mientras se recorre la cadena.
git stash push --include-untracked --message "rendu-sprint-updates-$(date +%s)"
SHARED_COMMIT="$(git rev-parse HEAD)"

git checkout "$BASE_BRANCH"
git cherry-pick "$SHARED_COMMIT"

git checkout "$BRANCH_HU07"
git merge --no-edit --no-ff "$BASE_BRANCH"
git stash pop
commit_paths "feat(HU-07): publicar subproductos" \
  docs/README-desarrollo.md \
  docs/README-frontend.md \
  scripts/commit-sprint-2.sh \
  frontend/src/pages/PostSubproductPage.tsx

git stash push --include-untracked --message "rendu-sprint-updates-$(date +%s)"
git checkout "$BRANCH_HU08"
git merge --no-edit --no-ff "$BRANCH_HU07"
git stash pop
commit_paths "feat(HU-08): asociar fotografias a subproductos" \
  frontend/src/api/client.ts \
  frontend/src/api/mockClient.ts \
  frontend/src/components/forms/PhotoDropzone.tsx \
  frontend/src/types/index.ts

git stash push --include-untracked --message "rendu-sprint-updates-$(date +%s)"
git checkout "$BRANCH_HU09"
git merge --no-edit --no-ff "$BRANCH_HU08"
git stash pop
commit_paths "feat(HU-09): mostrar fotografias en el catalogo" \
  frontend/src/components/ui/SubproductCard.tsx

git stash push --include-untracked --message "rendu-sprint-updates-$(date +%s)"
git checkout "$BRANCH_HU10"
git merge --no-edit --no-ff "$BRANCH_HU09"
git stash pop
commit_paths "feat(HU-10): mostrar fotografia en el detalle" \
  frontend/src/pages/SubproductDetailPage.tsx

git stash push --include-untracked --message "rendu-sprint-updates-$(date +%s)"
git checkout "$BRANCH_HU11"
git merge --no-edit --no-ff "$BRANCH_HU10"
git stash pop
commit_paths "feat(HU-11): actualizar fotografia del subproducto" \
  frontend/src/pages/UpdateSubproductPage.tsx

echo
echo "Cadena actualizada correctamente:"
git log --oneline --decorate --max-count=10
echo
echo "Rama actual: $(git branch --show-current)"
