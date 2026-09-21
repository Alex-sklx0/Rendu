---
name: rendu-backend-mvc
description: Use this skill when restructuring the RENDU backend from the current microservices layout (/services/*) into a single MVC monolith. Trigger for any task that touches /services, /docker-compose.yml, backend folder structure, or that mentions "migrar a MVC", "simplificar el backend", or "quitar microservicios". Do not use for frontend work (see .agents/skills/rendu-frontend/SKILL.md instead) or for database schema design (owned by Natalia).
---

> [!NOTE]
> **Migración completada el 2026-09-05.** La carpeta `/backend` ya existe con la estructura MVC
> completa. Los microservicios en `/services` fueron eliminados. Este documento se conserva
> como referencia histórica del proceso de migración.

# RENDU — Migrar el backend de microservicios a MVC (monolito)

## Por qué se hace este cambio
El dominio del problema (un prototipo académico de marketplace con 4 recursos: usuarios,
empresas, subproductos, catálogo) no justifica la complejidad operativa de microservicios
(4 servicios independientes + api-gateway + orquestación de red entre contenedores). Un
monolito organizado en **MVC** es más simple de correr, depurar y entregar en el tiempo de un
semestre, y sigue siendo perfectamente refactorizable a microservicios más adelante si el
proyecto creciera.

**Esta migración es solo de backend.** El frontend (`/frontend`) ya está construido, funciona
correctamente contra los mocks, y **no se toca** en esta tarea salvo por una única variable de
entorno (ver "Qué actualizar en el frontend" más abajo).

## Estado actual (antes de migrar)
```
services/
├── auth-service/          (stub Express, puerto 8001)
├── empresas-service/      (stub Express, puerto 8002)
├── subproductos-service/  (stub Express, puerto 8003)
├── catalogo-service/      (stub Express, puerto 8004)
└── api-gateway/           (nginx reverse proxy, puerto 8000 → enruta a los 4 anteriores)
database/postgres/         (esquema y migraciones — no se mueve, se queda igual)
docker-compose.yml         (levanta frontend + postgres + los 5 servicios de arriba)
```

## Estado objetivo (después de migrar)
```
backend/
├── package.json
├── Dockerfile
├── .env.example
├── src/
│   ├── server.js                  # arranque de Express, monta las rutas y middlewares
│   ├── config/
│   │   └── db.js                  # conexión a Postgres (pg / Pool)
│   ├── routes/
│   │   ├── index.js                # agrega todas las rutas bajo /api
│   │   ├── usuarios.routes.js
│   │   ├── empresas.routes.js
│   │   ├── subproductos.routes.js
│   │   └── catalogo.routes.js
│   ├── controllers/
│   │   ├── usuarios.controller.js
│   │   ├── empresas.controller.js
│   │   ├── subproductos.controller.js
│   │   └── catalogo.controller.js
│   ├── models/
│   │   ├── usuario.model.js         # queries SQL de esa tabla, nada de lógica de negocio aquí
│   │   ├── empresa.model.js
│   │   └── subproducto.model.js
│   ├── services/                    # lógica de negocio pura (sin SQL directo)
│   │   ├── usuarios.service.js      # ej. hashear password, armar respuesta
│   │   ├── empresas.service.js
│   │   └── subproductos.service.js
│   └── middlewares/
│       ├── errorHandler.js
│       └── validate.js              # valida req.body contra un schema (zod/joi)
database/postgres/                  # SIN CAMBIOS — sigue siendo de Natalia
docker-compose.yml                  # ahora levanta: frontend + backend + postgres (3 servicios)
```

> Nombres de carpetas orientativos — si Antigravity prefiere `controllers/` en singular o una
> convención distinta ya usada en otro proyecto de referencia del equipo, priorizar
> consistencia interna sobre el nombre exacto de la carpeta.

## Pasos de la migración

1. **Crear `/backend`** con la estructura de arriba y un único `package.json` (dependencias:
   `express`, `cors`, `pg`, y lo que ya usaban los stubs).

2. **Consolidar rutas**: cada uno de los 4 `services/*-service/src/index.js` se convierte en un
   par `routes/*.routes.js` + `controllers/*.controller.js` dentro de `/backend`, montados así:
   - `auth-service` → `routes/usuarios.routes.js` → `/api/usuarios`
   - `empresas-service` → `routes/empresas.routes.js` → `/api/empresas`
   - `subproductos-service` → `routes/subproductos.routes.js` → `/api/subproductos`
   - `catalogo-service` → `routes/catalogo.routes.js` → `/api/catalogo`

   Mantener el mismo contrato de datos que ya existe en `/docs/api-contract.md` — esta
   migración cambia la organización de carpetas y el prefijo de ruta (de un puerto por
   servicio a `/api/<recurso>` en un solo puerto), **no** la forma de los request/response.

3. **Un solo `GET /health`** en `server.js` (reemplaza los 4 `/health` individuales y el del
   gateway).

4. **Eliminar `services/api-gateway`** por completo — ya no hace falta reverse proxy con un solo
   servicio detrás.

5. **Eliminar** `services/auth-service`, `services/empresas-service`, `services/subproductos-service`,
   `services/catalogo-service` una vez su contenido esté migrado a `/backend`.

6. **Actualizar `docker-compose.yml`** en la raíz: reemplazar los 5 servicios
   (`auth-service`, `empresas-service`, `subproductos-service`, `catalogo-service`,
   `api-gateway`) por un único servicio `backend` (build `./backend`, puerto `8000:8000`,
   `depends_on: postgres`, misma `DATABASE_URL`). `frontend` y `postgres` quedan igual.

7. **Actualizar `AGENTS.md`** (raíz del repo): la sección "Estructura del repo" debe describir
   `/backend` en vez de `/services/*`, manteniendo la nota de que sigue siendo propiedad de
   Carolina y que el frontend no se toca desde ahí.

8. **Actualizar `README.md`** (raíz): sección "Cómo trabajar cada quien por separado" — el punto
   de Carolina pasa de "cada servicio en `/services/*` es independiente" a "`cd backend && npm
   install && npm run dev`".

9. **Retirar o archivar** este mismo skill (`rendu-backend-mvc`) una vez completada la
   migración, ya que deja de ser una tarea pendiente — o dejarlo como referencia histórica si el
   equipo lo prefiere.

## Qué actualizar en el frontend (lo único que lo toca)
En `frontend/.env.example` y en el bloque `environment` del servicio `frontend` dentro de
`docker-compose.yml`, `VITE_API_BASE_URL` debe seguir apuntando a `http://localhost:8000`
(el puerto no cambia), pero ahora ese puerto lo expone `backend` directamente en vez del
`api-gateway`. No es necesario tocar ningún componente ni página de `/frontend/src`.

## Qué NO hacer
- No tocar nada dentro de `/frontend/src` — ya está terminado y aprobado.
- No mover ni renombrar `/database/postgres` — sigue siendo responsabilidad de Natalia, con la
  misma estructura (`init/00-schema.sql.example`).
- No introducir lógica de negocio real todavía si no existía ya en los stubs — el objetivo de
  esta tarea es **reorganizar la estructura**, no implementar los endpoints. Los controllers
  migrados pueden seguir siendo stubs (`res.json({ implemented: false })`) hasta que Carolina
  los desarrolle.
- No agregar un API gateway "por si acaso" — con un solo backend no cumple ninguna función.

## Checklist de "migración completa"
1. `docker compose up --build` levanta exactamente 3 servicios: `frontend`, `backend`, `postgres`.
2. `GET http://localhost:8000/health` responde `200`.
3. `/services/*` ya no existe en el repo.
4. `docs/api-contract.md` sigue siendo válido sin cambios de forma (solo cambia por dónde se
   accede, no qué se envía o recibe).
5. `AGENTS.md` y `README.md` reflejan la nueva estructura.
6. El frontend sigue funcionando sin cambios de código, solo repuntando la misma URL de siempre.
