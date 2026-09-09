# RENDU — Guía de desarrollo

Este documento contiene la información práctica para trabajar en el repositorio. La descripción del problema, el propósito de RENDU y su funcionamiento general están en el [README principal](../README.md).

## Estructura del repositorio

```text
RENDU/
├── frontend/                  # React + TypeScript + Vite
├── backend/                   # Monolito MVC con Express y Node 20
├── database/postgres/         # Esquema y migraciones de PostgreSQL
├── docs/                      # Contratos, roles y documentación del proyecto
├── docker-compose.yml         # Frontend, backend y PostgreSQL
└── AGENTS.md                  # Contexto y reglas para agentes del proyecto
```

### Frontend

El frontend vive en `frontend/` y contiene:

- `src/pages/`: pantallas y rutas de la aplicación.
- `src/components/`: componentes reutilizables de interfaz y formularios.
- `src/api/`: punto de acceso a datos y cliente mock.
- `src/types/`: tipos compartidos del frontend.
- `src/lib/`: constantes, validadores y utilidades.

### Backend

El backend está organizado como un monolito MVC:

- `routes/`: definición de endpoints.
- `controllers/`: entrada y salida de las solicitudes HTTP.
- `services/`: lógica de negocio.
- `models/`: acceso a datos y consultas.
- `middlewares/`: validación y manejo de errores.

Los controllers todavía contienen stubs en varias áreas. La lógica de negocio del backend debe implementarse siguiendo [`docs/agents/api-contract.md`](agents/api-contract.md).

## Requisitos

- Node.js 20 o superior.
- npm.
- Docker y Docker Compose para levantar todo el stack.

## Levantar el proyecto completo

```bash
docker compose up --build
```

Servicios disponibles:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

Para detener los servicios:

```bash
docker compose down
```

Para recrear también el volumen de PostgreSQL:

```bash
docker compose down -v
docker compose up --build
```

## Trabajar solo en el frontend

```bash
cd frontend
npm install
npm run dev
```

Comandos disponibles:

```bash
npm run dev       # servidor de desarrollo
npm run build     # comprobación TypeScript y build de producción
npm run lint      # ESLint
npm run preview   # vista previa del build
```

Por defecto el frontend usa datos simulados en el navegador:

```text
VITE_USE_MOCKS=true
```

Los mocks se guardan en `localStorage`, por lo que permiten probar publicaciones y actualizaciones sin backend. Cuando la API real esté lista, configurar:

```text
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:8000
```

Estas variables pueden definirse en `frontend/.env` o mediante la configuración de Docker.

## Trabajar solo en el backend

```bash
cd backend
npm install
npm run dev
```

El backend debe respetar las formas documentadas en el contrato de API. Si cambia el nombre, tipo o estructura de un campo, se deben actualizar en el mismo cambio:

1. [`docs/agents/api-contract.md`](agents/api-contract.md).
2. Los tipos de [`frontend/src/types`](../frontend/src/types).
3. Los clientes real y mock cuando corresponda.

## Reglas de negocio relevantes

- Los generadores publican materiales y pueden consultar precios para comparar.
- Los transformadores consultan materiales y precios para comprar.
- Los recicladores consultan el catálogo para recoger materiales; no compran dentro de la plataforma.
- Una persona puede ser reciclador o transformador.
- Una empresa puede ser generadora o transformadora.
- Las publicaciones pueden estar disponibles o no disponibles.
- El catálogo debe considerar publicaciones activas y filtros por familia y municipio.

El detalle completo de roles está en [`docs/agents/roles.md`](agents/roles.md).

## Convenciones de trabajo

- El repositorio es un monorepo.
- Se trabaja con una rama por historia de usuario, por ejemplo `feature/hu-03-registrar-subproducto`.
- Los cambios se integran mediante pull request contra `main`.
- Cada pull request debe ser revisado por al menos un compañero.
- No mezclar responsabilidades entre `frontend/`, `backend/` y `database/`.
- No implementar lógica de negocio del backend desde el trabajo de frontend.

## Documentación relacionada

- [`README.md`](../README.md): propósito, alcance y funcionamiento de RENDU.
- [`README-frontend.md`](README-frontend.md): funcionamiento detallado del frontend y responsabilidad de cada archivo.
- [`api-contract.md`](agents/api-contract.md): contrato compartido entre frontend y backend.
- [`roles.md`](agents/roles.md): reglas de participación y precios.
- [`rendu-backend-mvc-SKILL.md`](agents/rendu-backend-mvc-SKILL.md): guía de arquitectura backend.
