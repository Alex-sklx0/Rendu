# database/postgres

**Responsable:** Natalia Giraldo Morales.

Este folder define el esquema de PostgreSQL para RENDU.

- `init/00-schema.sql.example`: borrador de tablas basado en las tarjetas de Trello
  (`usuarios`, `empresas`, `familias_material`, `subproductos`, `manifestaciones_interes`).
  Es un punto de partida, **no un esquema definitivo** — Natalia debe revisarlo, ajustarlo y
  renombrarlo a `.sql` (sin `.example`) para que Postgres lo ejecute automáticamente al
  iniciar el contenedor (`docker-entrypoint-initdb.d`).
- Mientras el archivo tenga el sufijo `.example`, Postgres lo ignora y el contenedor arranca
  con una base de datos vacía.
