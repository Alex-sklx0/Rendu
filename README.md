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
├── backend/                      # Monolito MVC Express — propiedad de Carolina
│   ├── src/
│   │   ├── server.js             # arranque de Express
│   │   ├── config/db.js          # conexión a Postgres
│   │   ├── routes/               # un archivo por recurso
│   │   ├── controllers/          # lógica de request/response
│   │   ├── models/               # queries SQL
│   │   ├── services/             # lógica de negocio
│   │   └── middlewares/          # errorHandler, validate
│   ├── package.json
│   └── Dockerfile
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
- **Backend** en http://localhost:8000 (monolito MVC, `GET /health` disponible)
- **PostgreSQL** en `localhost:5432` (usuario/clave `rendu`/`rendu`, base `rendu`)

El frontend **no depende de que el backend esté implementado**: por defecto usa
datos simulados en el navegador (`VITE_USE_MOCKS=true`). Cuando el backend real esté listo,
cambia esa variable a `false` en `docker-compose.yml` (o en `frontend/.env`).

## Cómo trabajar cada quien por separado

- **David (frontend)**: no necesitas Docker para el día a día — `cd frontend && npm install &&
  npm run dev`. Lee `.agents/skills/rendu-frontend/SKILL.md` antes de empezar.
- **Carolina (backend)**: `cd backend && npm install && npm run dev`. Implementa los controllers
  en `src/controllers/` siguiendo `/docs/api-contract.md`. Los models van en `src/models/` y
  la lógica de negocio pura en `src/services/`.
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
