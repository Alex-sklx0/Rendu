# RENDU — Mercado digital de subproductos industriales

Prototipo funcional del proyecto RENDU (Proyecto Aplicado en TIC 1, UPB). Ver
`docs/contexto-proyecto.md` (o el PDF original del equipo) para la problemática completa.

## Estructura

```
rendu-platform/
├── AGENTS.md                     # contexto para agentes de IA (Antigravity, etc.)
├── .agents/skills/rendu-frontend # skill de Antigravity con el alcance de David
├── docker-compose.yml            # levanta TODO el stack para desarrollo local
├── frontend/                     # React + TS + Vite — propiedad de David
├── services/                     # microservicios backend (stubs) — propiedad de Carolina
│   ├── auth-service/
│   ├── empresas-service/
│   ├── subproductos-service/
│   ├── catalogo-service/
│   └── api-gateway/
├── database/postgres/            # esquema y migraciones — propiedad de Natalia
└── docs/api-contract.md          # contrato de API compartido frontend ↔ backend
```

## Cómo levantar todo el proyecto (cualquier miembro del equipo)

Requisitos: Docker + Docker Compose.

```bash
docker compose up --build
```

Esto levanta:
- **Frontend** en http://localhost:5173
- **API Gateway** en http://localhost:8000 (enruta a los servicios)
- **Servicios backend** (stubs, cada uno con `GET /health`) en los puertos 8001–8004
- **PostgreSQL** en `localhost:5432` (usuario/clave `rendu`/`rendu`, base `rendu`)

El frontend **no depende de que los servicios backend estén implementados**: por defecto usa
datos simulados en el navegador (`VITE_USE_MOCKS=true`). Cuando el backend real esté listo,
cambia esa variable a `false` en `docker-compose.yml` (o en `frontend/.env`).

## Cómo trabajar cada quien por separado

- **David (frontend)**: no necesitas Docker para el día a día — `cd frontend && npm install &&
  npm run dev`. Lee `.agents/skills/rendu-frontend/SKILL.md` antes de empezar.
- **Carolina (backend)**: cada servicio en `/services/*` es independiente — `cd
  services/auth-service && npm install && npm run dev`. Reemplaza el contenido de `src/index.js`
  siguiendo `/docs/api-contract.md`.
- **Natalia (base de datos)**: trabaja en `/database/postgres`. El archivo
  `init/00-schema.sql.example` es un borrador — renómbralo a `.sql` cuando esté validado y
  Postgres lo ejecutará automáticamente la próxima vez que se recree el volumen
  (`docker compose down -v && docker compose up`).
- **Miguel (QA/documentación)**: usa `docker compose up` para probar el flujo end-to-end una vez
  el backend tenga lógica real; mientras tanto puede probar el frontend solo con los mocks.

## Convenciones

- Un repositorio (monorepo), una rama por historia de usuario (`feature/hu-03-registrar-subproducto`),
  PR contra `main` revisado por al menos un compañero.
- Cualquier cambio en la forma de un request/response se documenta en `docs/api-contract.md`
  en el mismo PR que lo introduce.
