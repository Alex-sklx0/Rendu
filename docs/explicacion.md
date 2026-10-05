# RENDU — Explicación del sistema

Este documento explica de forma integral cómo funciona el proyecto RENDU: arquitectura,
base de datos, backend, frontend, contenedores y cómo se comunican las partes. Está pensado
para alguien que quiere entender el sistema completo sin leer todo el código.

> Estado documentado: corresponde al código actual del repo (integración con Supabase activa).
> Algunos documentos del repo (`README-desarrollo.md`, `README-frontend.md`, `AGENTS.md`) están
> **desactualizados** y todavía describen mocks, Postgres local y un docker-compose de 3 servicios.
> Aquí se describe lo que el código hace realmente.

---

## 1. Visión general

RENDU es un mercado digital para conectar empresas del Valle de Aburrá que generan
subproductos sólidos industriales (papel/cartón, plásticos, vidrio, metales, textil, madera)
con empresas transformadoras, ECAs y recicladores que pueden aprovecharlos. Es un prototipo
funcional académico (UPB): **no hay pagos, logística ni matching por IA**.

La arquitectura es de 3 capas:

```text
┌──────────────┐   HTTP/JSON   ┌──────────────┐   SDK de Supabase   ┌─────────────────────────┐
│  Frontend    │ ───────────▶  │  Backend     │ ──────────────────▶ │  Supabase (nube)        │
│  React 18    │   fetch       │  Express 5   │   @supabase-js      │  ├─ Postgres (BD real)  │
│  + TS + Vite │ ◀───────────  │  Monolito MVC│ ◀─────────────────  │  └─ Storage (bucket     │
└──────────────┘   JSON        └──────────────┘                     │     "Imagenes")        │
   (Vite:5173)                     (Express:8000)                    └─────────────────────────┘
```

- El **frontend** nunca habla con la base de datos directamente. Siempre pasa por el backend.
- El **backend** es el único que tiene las credenciales de Supabase y accede a Postgres y Storage.
- La conexión a Postgres se hace con el **cliente de Supabase** (`@supabase/supabase-js`), que
  internamente usa la API REST PostgREST, no SQL directo con `pg`/pool.

---

## 2. Base de datos (Supabase Postgres)

La base de datos vive en un proyecto de **Supabase** en la nube, no en un contenedor local.
Se identifica por la URL del proyecto (`SUPABASE_URL`, de la forma
`https://<proyecto>.supabase.co`).

### 2.1 Tablas que usa el backend

El backend consulta estas tablas (nombres tal cual los usa el código):

| Tabla | Propósito | Columnas relevantes |
|---|---|---|
| `usuarios` | Cuenta base (login) | `id`, `email` (único), `password_hash`, `fecha_registro` |
| `empresas` | Perfil de empresa (generadora/transformadora) | `id`, `id_usuario`, `nombre`, `nit` (único), `id_municipio`, `id_rol` |
| `personas` | Perfil de persona natural (reciclador/transformador) | `id`, `id_usuario`, `nombre`, `cedula` (único), `id_municipio`, `id_rol` |
| `roles` | Catálogo de roles | `id`, `nombre` |
| `municipios` | Catálogo de municipios | `id`, `nombre` |
| `familias_material` | Catálogo de familias de material | `id`, `nombre` |
| `unidades_medida` | Catálogo de unidades | `id`, `nombre`, `abreviatura` |
| `subproductos` | Publicaciones de las empresas | `id`, `id_empresa`, `nombre`, `descripcion`, `id_familia_material`, `volumen_disponible`, `id_unidad_medida`, `id_municipio`, `direccion`, `foto_url`, `fecha_registro`, `disponible` |

### 2.2 Catálogos fijos (IDs por referencia)

- **Familias**: `1` Papel y cartón, `2` Plásticos, `3` Vidrio, `4` Metales, `5` Textiles, `6` Madera.
- **Unidades**: `1` kg, `2` t (ton), `3` m³.
- **Municipios** (1 a 10): Medellín, Bello, Itagüí, Envigado, Sabaneta, Copacabana, Barbosa, Caldas, La Estrella, Girardota.
- **Roles**: `1` GENERADOR, `2` TRANSFORMADOR, `3` RECICLADOR.
  - Empresa: solo `1` (generadora) o `2` (transformadora).
  - Persona: solo `2` (transformadora) o `3` (reciclador).

### 2.3 Esquema local vs. esquema real

- `database/postgres/init/00-schema.sql.example` es un **borrador** del esquema (`usuarios`,
  `empresas`, `familias_material`, `subproductos`, `manifestaciones_interes`) con IDs UUID y
  columnas distintas (por ejemplo `tipo_actor`, `municipio` como texto). **No se usa**: el
  contenedor local de Postgres no está en el compose y Supabase ya tiene su propio esquema
  (IDs numéricos, `id_rol`, `id_municipio`, etc.). Este borrador quedó como referencia del
  diseño original.
- `database/postgres/diagrama_relacional_rendu.png` es el diagrama relacional del esquema.

---

## 3. Supabase Storage (imágenes)

Todas las imágenes (fotos de subproductos) se guardan en el bucket **`Imagenes`** de Supabase
Storage.

Flujo real (`backend/src/services/storage.service.js`):

1. El frontend envía la imagen como **Base64** (Data URI) dentro del JSON del request
   (campo `image_base64`).
2. El backend la convierte a `Buffer`, detecta el mime/extensión, genera un nombre único con
   `crypto.randomUUID()` (ruta tipo `subproductos/<uuid>.jpg`) y la sube con
   `supabase.storage.from('Imagenes').upload(...)`.
3. Genera la **URL pública** (`getPublicUrl`) y la guarda en `subproductos.foto_url` en Postgres.
4. Al **actualizar** la foto se borra el archivo anterior del storage (reemplazo).
5. Al **eliminar** un subproducto se borra también su foto del storage (`deleteStorageFile`).

Si el input ya es una URL `http(s)`, la función la devuelve tal cual sin reprocesarla
(permite guardar imágenes externas también).

---

## 4. Backend (Express 5, monolito MVC)

Live en `backend/`. Es un monolito Express con Node 20/22, organizado en MVC. Aunque la
carpeta tiene `models/` y `services/`, **la lógica real está dentro de los controllers**, que
usan el cliente de Supabase directamente. `models/` y `services/` son placeholders con TODO.

### 4.1 Arranque

```text
backend/server.js  (carga .env, inicia Express en el PORT)
       ↓
src/app.js         (CORS, express.json, GET /health, monta /api, errorHandler)
       ↓
src/routes/index.js (Router central: agrega las 5 rutas bajo /api)
```

Configuración relevante:

- `PORT` (`.env`): 3000 de forma local; Docker lo fuerza a `8000`.
- `src/config/db.js`: crea el cliente Supabase único de la app con
  `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Usa **service role key**, que tiene acceso
  administrativo y evade RLS; por eso nunca debe filtrarse al frontend.
- `src/middlewares/errorHandler.js`: centraliza errores y traduce códigos de Postgres/Supabase
  (ej. `23505` duplicado → 409, `23503` FK → 404, `PGRST116` no encontrado → 404) a mensajes
  amigables.
- `src/middlewares/validate.js`: placeholder sin validación real (solo pasa).

### 4.2 Endpoints

Todas las rutas están bajo **`/api`**. El formato de respuesta es siempre JSON
`{ ok: true, ... }` en éxito y `{ ok: false, error: "..." }` en error.

| Método | Ruta | Query/Body | Función | Descripción |
|---|---|---|---|---|
| `GET` | `/health` | — | (en `app.js`) | Health check del servicio |
| `POST` | `/api/usuarios` | `{ email, password }` | `registrarUsuario` | Crea usuario, hashea password con bcrypt (10). 409 si el email existe |
| `POST` | `/api/usuarios/login` | `{ email, password }` | `loginUsuario` | Verifica credenciales y busca empresa/persona vinculada. Devuelve usuario + empresa |
| `DELETE` | `/api/usuarios/:id` | — | `eliminarUsuario` | Elimina subproductos/empresa/persona y el usuario |
| `POST` | `/api/empresas` | `{ id_usuario, nombre, nit, id_municipio \| municipio, id_rol \| tipo_actor }` | `registrarEmpresa` | Registra empresa, normaliza NIT, resuelve rol/municipio. 409 si NIT duplicado |
| `POST` | `/api/personas` | `{ id_usuario, nombre, cedula, id_municipio \| municipio, id_rol \| tipo_actor }` | `registrarPersona` | Registra persona natural (reciclador/transformador) |
| `POST` | `/api/subproductos` | `{ id_empresa, nombre, descripcion?, id_familia_material \| id_familia, volumen_disponible, id_unidad_medida \| unidad_volumen, id_municipio \| municipio, direccion?, image_base64? }` | `registrarSubproducto` | Crea subproducto, sube imagen a Storage si viene base64. Solo empresas (403 a personas) |
| `POST` | `/api/subproductos/upload` | `{ image \| image_url \| foto_url }` | `subirImagenSubproducto` | Endpoint independiente para subir solo la imagen a Storage |
| `GET` | `/api/subproductos/mis-publicaciones` | `?id_empresa=` | `misPublicaciones` | Publicaciones de una empresa, ordenadas por fecha desc |
| `GET` | `/api/subproductos/:id` | — | `obtenerSubproducto` | Detalle de un subproducto con nombres de familia/municipio/empresa |
| `PATCH` | `/api/subproductos/:id` | `{ id_empresa, ...campos }` | `actualizarSubproducto` | Actualiza campos editables (`nombre`, `descripcion`, `volumen_disponible`, `foto_url`, `direccion`, `disponible`). Valida propiedad → 403 si otra empresa |
| `DELETE` | `/api/subproductos/:id` | `?id_empresa=` | `eliminarSubproducto` | Elimina subproducto y su foto del storage |
| `GET` | `/api/catalogo` | `?q=&familia=&municipio=` | `listarCatalogo` | Catálogo de subproductos `disponible`, ordenados por fecha desc, con nombres unidos |

Detalle de comportamiento del catálogo y los filtros en `subproductos.controller.js` /
`catalogo.controller.js`:

- El `GET /api/catalogo` filtra por texto (`q`, ilike sobre nombre), familia y municipio, y
  en cada resultado une los nombres de `familias_material`, `municipios`, `unidades_medida` y
  `empresas`, exponiendo `familia`, `municipio`, `unidad_volumen`, `empresa` e `image_url`.
- Los objetos de subproducto que devuelven los controllers "presentan" el dato con nombres
  legibles (`present()`) además de los IDs crudos.

---

## 5. Cómo se comunica el frontend con la base de datos

El frontend **no consulta Supabase directamente**. El camino completo es:

```text
Página React (CatalogPage, ProfilePage, PostSubproductPage, ...)
       ↓ usa funciones de la capa de API
frontend/src/api/client.ts   (fetch con VITE_API_BASE_URL, default http://localhost:8000/api)
       ↓ JSON sobre HTTP
Backend Express: routes → controllers → @supabase/supabase-js
       ↓ REST/PostgREST + Storage
Supabase Postgres y Supabase Storage
```

Detalles:

- `client.ts` centraliza las peticiones con funciones privadas `get` y `post` y desempaqueta
  las respuestas verificando el flag `ok` (`unwrap`). Convierte errores HTTP en `Error` con el
  mensaje legible del backend.
- **Mapeo de campos**: el backend devuelve IDs crudos; `client.ts` los transforma al modelo
  visual del frontend (`mapSubproducto`). Ejemplos: `foto_url` → `image_url`,
  `id_unidad_medida` → `unidad_volumen` ("kg"/"ton"/"m3"), `id_municipio` → nombre del
  municipio usando `MUNICIPIOS_VALLE_ABRRA`, `disponible` → boolean.
- **Funciones expuestas**:
  `registrarUsuario`, `loginUsuario`, `registrarEmpresa`, `registrarPersona`,
  `registrarSubproducto`, `getCatalogo`, `getSubproductoDetalle`, `getMisPublicaciones`,
  `actualizarSubproducto`, `eliminarSubproducto`, `cambiarEstadoPublicacion`,
  `eliminarCuenta`.
- No hay autenticación con JWT: para operaciones de escritura sobre subproductos el frontend
  envía `id_empresa` plano en el body/query, y el backend confía en ese dato para validar
  propiedad (deuda técnica conocida).

---

## 6. Frontend (React 18 + TypeScript + Vite 5)

Live en `frontend/`. SPA (Single Page Application) de React.

### 6.1 Tecnologías

- **React 18** + **TypeScript** estricto.
- **Vite 5**: dev server (puerto 5173) y build de producción.
- **React Router** (`createBrowserRouter`): navegación por URL sin recargar.
- **Tailwind CSS 3**: estilos utilitarios; tokens en `tailwind.config.ts`.
- **React Hook Form** + **Zod**: formularios con validación (`zodResolver`).
- **Sin estado global**: cada página usa su propio `useState`/`useEffect` y llama a la capa de API.

### 6.2 Arranque

```text
index.html → src/main.tsx (createRoot + StrictMode) → src/App.tsx (RouterProvider) → src/router.tsx (rutas) → AppShell → página
```

- `AppShell` (`components/layout/AppShell.tsx`) es el layout: header con logo, navegación
  (Publicar, Catálogo, Matching), notificaciones y avatar. Oculta el header en pantallas
  "standalone" (splash, login, registro, comunicación).
- El catálogo nav "Publicar" depende de `localStorage` (`isAuthenticated`, `user`) para decidir
  si lleva a `/post-subproduct` o a `/login`. Los usuarios persona (sin `id_empresa`) no ven el
  botón "Publicar".

### 6.3 Rutas principales

| URL | Componente | Propósito |
|---|---|---|
| `/` | `SplashPage` | Splash inicial con redirección automática |
| `/splash1..3` | `Splash1..3Page` | Onboarding informativo |
| `/pre-register` | `PreRegisterPage` | Elegir persona o empresa |
| `/person-registration` / `/company-registration` | `Person/CompanyRegistrationPage` | Registros |
| `/login` | `LoginPage` | Inicio de sesión |
| `/catalog` | `CatalogPage` | Catálogo con búsqueda y filtros |
| `/catalog/:id` | `SubproductDetailPage` | Detalle del subproducto |
| `/profile` | `ProfilePage` | Perfil y publicaciones propias |
| `/subproduct/:id/edit` | `UpdateSubproductPage` | Editar subproducto |
| `/post-subproduct` | `PostSubproductPage` | Publicar subproducto |
| `/subproducts/new` | `RegisterSubproductPage` | Formulario alternativo (con stepper) |
| `/matching` | `MatchingPage` | Módulo de coincidencias (visual) |

### 6.4 Estructura de `src`

```text
frontend/src/
├── api/client.ts      # única capa de datos (fetch al backend)
├── components/        # ui (Button, Input, Select, SubproductCard, ...) y forms (FamilySelect, PhotoDropzone, ...)
├── pages/             # una pantalla por ruta
├── lib/               # constants.ts, validators.ts (Zod), clsx.ts
├── types/index.ts     # modelos Usuario, Empresa, SubproductoCatalogo, SubproductoDetalle
├── img/               # imágenes y wireframes
├── router.tsx / App.tsx / main.tsx / index.css
```

### 6.5 Formularios

- Los esquemas Zod viven en `src/lib/validators.ts` (`personaSchema`, `empresaRegistroSchema`,
  `subproductoSchema`, etc.).
- Las constantes (familias, municipios, unidades, tipos de actor) viven en `src/lib/constants.ts`
  y alimentan los selects de formularios y filtros.
- `PhotoDropzone` captura fotos en el navegador y las convierte para enviarlas como base64.

---

## 7. Docker

`docker-compose.yml` en la raíz levanta **2 servicios** (ya no incluye Postgres; la BD es Supabase
en la nube):

| Servicio | Build | Puerto | Notas |
|---|---|---|---|
| `frontend` | `./frontend` (target `dev`) | `5173:5173` | Servidor Vite dev. `VITE_API_BASE_URL=http://localhost:8000/api`, `VITE_USE_MOCKS=false` |
| `backend` | `./backend` | `8000:8000` | Toma credenciales de `backend/.env` (`env_file`). `PORT=8000` |

Ambos montan el código como volumen para desarrollo (`./frontend:/app`, `./backend:/app`) y
usan volúmenes nombrados (`frontend_node_modules`, `backend_node_modules`) para aislar
`node_modules`.

### 7.1 Dockerfile del frontend (multi-etapa)

- **dev**: `node:20-alpine`, instala con `npm ci`, corre `vite --host`.
- **build**: compila con `npm run build` → `dist/`.
- **production**: sirve `dist/` con **nginx** (`nginx:1.27-alpine`) usando `nginx.conf`, que
  redirige todas las rutas a `index.html` (`try_files $uri $uri/ /index.html`) — necesario para
  que las rutas internas de una SPA (ej. `/catalog/sp-1`) no den 404 al recargar.

### 7.2 Dockerfile del backend

- `node:22-alpine`, instala dependencias y ejecuta `npm run dev` (node con `--watch`).

### 7.3 Secretos

- `backend/.env` contiene `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Está en
  `.gitignore` **y no está commiteado** (bien). `backend/.env.example` es la plantilla sin
  valores reales.
- La `SUPABASE_SERVICE_ROLE_KEY` otorga privilegios de administrador en Supabase; nunca debe
  exponerse en el frontend ni en variables públicas de Vite.

---

## 8. Discrepancias y deuda técnica detectada

Estos puntos se encontraron al comparar el código real con la documentación y el contrato:

1. **`PATCH /api/subproductos/:id/publicar` no existe en el backend.** El frontend tiene
   `cambiarEstadoPublicacion` (`api/client.ts`) y el contrato `api-contract.md` lo documenta,
   pero `subproductos.routes.js` no lo define → devolvería 404. Hacer el toggle de
   "disponible" desde el perfil requiere usar el `PATCH /:id` normal (campo `disponible`).
2. **Filtros de catálogo no coinciden.** El frontend envía `?id_familia_material=..&id_municipio=..`
   a `/api/catalogo`, pero el controller lee `familias` → `familia` y `municipio`. Los filtros
   por familia y municipio desde el catálogo **no se aplican** en la BD actualmente.
3. **Docs desactualizados.** `README-desarrollo.md`, `README-frontend.md` y `AGENTS.md` describen
   `mockClient`, `VITE_USE_MOCKS` y un docker-compose con Postgres local, cuando en realidad el
   frontend siempre usa `fetch` y la BD es Supabase. `docs/api-contract.md` también menciona
   `id_estado_publicacion`, un campo que el código real no usa (usa `disponible`).
4. **Controladores con la lógica, models/services como placeholders.** La estructura MVC existe,
   pero la lógica está en los controllers usando Supabase directo; `models/` y `services/` quedaron
   como ejemplos TODO.
5. **Validación débil en escritura:** `validate.js` es un no-op y las operaciones de propiedad
   dependen de `id_empresa` enviado por el cliente (sin JWT). Deuda técnica para producción.
6. **Endpoint `/api/subproductos/upload` y `deleteStorageFile` usan distintas carpetas de
   referencia** (`subproductos/` al subir con `uploadImageToStorage` vs. `Imagenes` al borrar);
   en la práctica borra bien gracias al parseo de la URL pública.
7. **`cambiarEstadoPublicacion` y `eliminarSubproducto` del frontend** dependen de endpoints que
   existen (`DELETE /:id` con `?id_empresa=`) u otros que no (`/publicar`), por lo que conviene
   revisar el perfil antes de la entrega.

---

## 9. Comandos útiles

Desde la raíz:

```bash
docker compose up --build   # levanta frontend (5173) y backend (8000)
docker compose down         # apaga servicios
```

Backend (solo):

```bash
cd backend
npm install
npm run dev      # Express en el PORT de .env (por defecto 3000)
npm start
```

Frontend (solo):

```bash
cd frontend
npm install
npm run dev      # Vite en :5173
npm run build    # tsc -b && vite build
npm run lint     # ESLint
npm run preview
```

Nota: el frontend obtiene del backend las credenciales de Supabase indirectamente; solo necesita
`VITE_API_BASE_URL` para apuntar al backend correcto.