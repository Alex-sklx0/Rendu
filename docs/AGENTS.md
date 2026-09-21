# RENDU — contexto del proyecto

RENDU es un mercado digital para conectar empresas del Valle de Aburrá que generan
subproductos sólidos industriales (papel/cartón, plásticos, vidrio, metales, textil, madera)
con empresas transformadoras, ECAs y recicladores que pueden aprovecharlos. Proyecto académico
(Proyecto Aplicado en TIC, UPB) — prototipo funcional, sin pagos, sin logística automatizada,
sin matching por IA. Ver `docs/contexto-proyecto.md` para el detalle completo (extraído del
documento de problemática del proyecto).

## Estructura del repo
- `frontend/` — React + TypeScript + Vite. **Propiedad de David.** Todo el trabajo de UI vive
  aquí. Ver `.agents/skills/rendu-frontend/SKILL.md` antes de tocar este folder.
- `backend/` — Monolito MVC Express (Node 20). **Propiedad de Carolina.** Organizado en
  `routes/`, `controllers/`, `models/`, `services/` y `middlewares/`. Los controllers son stubs
  (`{ implemented: false }`) listos para que Carolina implemente la lógica. No implementar
  lógica de negocio aquí desde el agente de frontend.
- `database/postgres/` — esquema y migraciones. **Propiedad de Natalia.** Vacío por ahora.
- `docs/api-contract.md` — contrato de API compartido entre frontend y backend. Cualquier forma
  de request/response que el frontend asuma debe quedar documentada aquí.
- `docker-compose.yml` — levanta frontend + backend + Postgres (3 servicios) para desarrollo local.

## Reglas generales para cualquier agente en este repo
- No mezclar responsabilidades: un cambio de frontend no debe tocar `/backend` ni
  `/database`, y viceversa, salvo que se pida explícitamente.
- Cualquier decisión de forma de datos (nombres de campos, tipos) debe quedar reflejada en
  `docs/api-contract.md` y en `frontend/src/types`.
- Seguir siempre la skill específica del área que se esté tocando (`.agents/skills/*`).
