#!/usr/bin/env bash
# Divide los cambios pendientes del sprint 2 en ramas encadenadas por HU.
# Ejecutar desde la raiz del repositorio con los cambios sin commitear:
#   bash scripts/commit-sprint-2.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BASE_BRANCH="$(git branch --show-current)"
if [[ -z "$BASE_BRANCH" ]]; then
  echo "Error: no se pudo determinar la rama base." >&2
  exit 1
fi

BRANCHES=(
  "feature/hu-07-publicar-subproducto"
  "feature/hu-08-fotografia-subproducto"
  "feature/hu-09-catalogo-subproductos"
  "feature/hu-10-detalle-subproducto"
  "feature/hu-11-actualizar-subproducto"
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
    echo "Error: no hay cambios preparados para: $message" >&2
    exit 1
  fi
  git commit -m "$message"
}

echo "Rama base: $BASE_BRANCH"
echo "Creando ${BRANCHES[0]}..."
git checkout -b "${BRANCHES[0]}"

# HU-07 incluye la publicación y las pantallas compartidas que llegaron junto con
# este lote de trabajo. La reorganización documental se conserva en este primer
# commit para que las ramas posteriores hereden un repositorio consistente.
commit_paths "feat(HU-07): publicar subproductos y preparar flujo del sprint 2" \
  README.md \
  docs \
  scripts/commit-sprint-2.sh \
  frontend/src/api/client.ts \
  frontend/src/api/mockClient.ts \
  frontend/src/types/index.ts \
  frontend/src/components/ui/RenduLogo.tsx \
  frontend/src/img \
  frontend/src/pages/CommunicationPage.tsx \
  frontend/src/pages/LoginPage.tsx \
  frontend/src/pages/MatchingPage.tsx \
  frontend/src/pages/PostSubproductPage.tsx \
  frontend/src/pages/PreRegisterPage.tsx \
  frontend/src/pages/RegistroEmpresaPage.tsx \
  frontend/src/pages/RegistroPersonaPage.tsx \
  frontend/src/pages/Splash1Page.tsx \
  frontend/src/pages/Splash2Page.tsx \
  frontend/src/pages/Splash3Page.tsx \
  frontend/src/pages/SplashPage.tsx

echo "Creando ${BRANCHES[1]} desde ${BRANCHES[0]}..."
git checkout -b "${BRANCHES[1]}"
# PhotoDropzone ya estaba implementado en la base HU-03-06; se deja un commit
# explicito para documentar que HU-08 queda cubierta en esta cadena.
git commit --allow-empty -m "feat(HU-08): agregar fotografia al subproducto"

echo "Creando ${BRANCHES[2]} desde ${BRANCHES[1]}..."
git checkout -b "${BRANCHES[2]}"
commit_paths "feat(HU-09): consultar catalogo de subproductos" \
  frontend/src/components/ui/SubproductCard.tsx \
  frontend/src/pages/CatalogPage.tsx

echo "Creando ${BRANCHES[3]} desde ${BRANCHES[2]}..."
git checkout -b "${BRANCHES[3]}"
commit_paths "feat(HU-10): consultar detalle del subproducto" \
  frontend/src/pages/SubproductDetailPage.tsx

echo "Creando ${BRANCHES[4]} desde ${BRANCHES[3]}..."
git checkout -b "${BRANCHES[4]}"
commit_paths "feat(HU-11): actualizar publicaciones y consultar perfil" \
  frontend/src/components/layout/AppShell.tsx \
  frontend/src/pages/HomePage.tsx \
  frontend/src/router.tsx \
  frontend/src/pages/ProfilePage.tsx \
  frontend/src/pages/UpdateSubproductPage.tsx

echo
echo "Cadena creada correctamente:"
git log --oneline --decorate -6
 echo
echo "Rama actual: $(git branch --show-current)"
echo "Rama base original: $BASE_BRANCH"
