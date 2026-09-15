#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Script de commits — RENDU frontend redesign
# Ejecutar desde la raíz del repo: bash scripts/commit-registro-ui.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

BRANCH="feature/hu-01-02-03-registro-ui"

echo "🌿 Creando rama $BRANCH..."
git checkout -b "$BRANCH"

# ─────────────────────────────────────────────────────────────────────────────
# COMMIT 1 — feat(HU-01): formulario de registro persona
#
# Incluye: .gitignore, fuentes, design system (CSS), componentes UI base
# (FormField, Button, PasswordInput, Input, Select, Banner),
# header (AppShell), router, HomePage y la página RegisterPage
# (que contiene el tab Persona como vista principal).
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "📦 Commit 1: registro persona..."

git add .gitignore
git add frontend/index.html
git add frontend/src/index.css
git add frontend/src/lib/validators.ts
git add frontend/src/components/ui/FormField.tsx
git add frontend/src/components/ui/Button.tsx
git add frontend/src/components/ui/PasswordInput.tsx
git add frontend/src/components/ui/Input.tsx
git add frontend/src/components/ui/Select.tsx
git add frontend/src/components/ui/Banner.tsx
git add frontend/src/components/layout/AppShell.tsx
git add frontend/src/router.tsx
git add frontend/src/pages/HomePage.tsx
git add frontend/src/pages/RegisterPage.tsx

# Archivos eliminados relacionados
git add frontend/src/pages/RegisterUserPage.tsx 2>/dev/null || true

git commit -m "feat(HU-01): formulario de registro persona

- Nuevo diseño del header (AppShell): logo circular reciclaje + RENDU,
  navegación pill, línea gradiente verde→naranja.
- RegisterPage: card centrada con tabs Persona/Empresa, título
  'ÚNETE A LA CIRCULARIDAD', tab Persona con campos nombre completo,
  correo, contraseña (toggle ojo), checkbox términos, botón 'Crear cuenta →'.
- Nuevos componentes UI: PasswordInput con toggle visibilidad.
- Design system: index.css con card, tabs, gradiente y tipografía IBM Plex Sans.
- Validators: personaSchema (zod) y schemas backward-compatible.
- Router unificado: /registro → RegisterPage (reemplaza /registro/usuario).
- .gitignore completo para monorepo Node/Docker/editores."

# ─────────────────────────────────────────────────────────────────────────────
# COMMIT 2 — feat(HU-02): formulario de registro empresa
#
# Incluye: componentes de formulario compartidos con empresa
# (MunicipioSelect, FamilySelect con placeholders del mockup) y
# eliminación de RegisterCompanyPage que fue absorbido por RegisterPage.
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "📦 Commit 2: registro empresa..."

git add frontend/src/components/forms/MunicipioSelect.tsx
git add frontend/src/components/forms/FamilySelect.tsx

# Página eliminada (absorbida por RegisterPage tab Empresa)
git add frontend/src/pages/RegisterCompanyPage.tsx 2>/dev/null || true

git commit -m "feat(HU-02): formulario de registro empresa

- Tab Empresa en RegisterPage: campos razón social, NIT, correo
  corporativo, contraseña con toggle, checkbox términos.
- MunicipioSelect: placeholder 'Valle de Aburrá' según mockup.
- FamilySelect: placeholder 'Selecciona una opción' según mockup.
- Eliminada RegisterCompanyPage (lógica migrada al tab Empresa
  de RegisterPage con el esquema empresaRegistroSchema).
- validators.ts: empresaRegistroSchema con razon_social, NIT,
  email corporativo, password y aceptar_terminos."

# ─────────────────────────────────────────────────────────────────────────────
# COMMIT 3 — feat(HU-03-06): formulario de registro subproducto
#
# Incluye: Stepper, Textarea, PhotoDropzone y RegisterSubproductPage
# con layout de 2 columnas, drag-and-drop de fotos y footer de acciones.
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "📦 Commit 3: registro subproducto..."

git add frontend/src/components/ui/Stepper.tsx
git add frontend/src/components/ui/Textarea.tsx
git add frontend/src/components/forms/PhotoDropzone.tsx
git add frontend/src/pages/RegisterSubproductPage.tsx
git add frontend/src/components/forms/VolumeField.tsx

git commit -m "feat(HU-03-06): formulario de registro subproducto

- RegisterSubproductPage rediseñada con:
  · Encabezado 'NUEVO REGISTRO' + badge 'Borrador'.
  · Stepper visual 3 pasos: Información → Ubicación → Revisión.
  · Layout 2 columnas: drag-and-drop fotos (izq) + campos (der).
  · Campos: nombre, familia de material, municipio (2 cols),
    volumen + unidad, descripción (textarea).
  · Info-banner: 'La ubicación exacta solo será visible para
    contactos autorizados.'
  · Footer: ← Volver / Guardar borrador / Continuar →.
- Nuevos componentes: Stepper, Textarea, PhotoDropzone (preview
  local, hasta 3 fotos JPG/PNG 5 MB, sin upload al backend aún).
- VolumeField actualizado para layout del mockup."

echo ""
echo "✅ Listo. 3 commits en rama '$BRANCH'."
echo ""
echo "Para ver el log:"
echo "  git log --oneline -5"
echo ""
echo "Para subir la rama al remoto (cuando esté configurado):"
echo "  git push -u origin $BRANCH"
