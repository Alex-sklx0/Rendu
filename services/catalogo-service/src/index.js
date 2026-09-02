import express from "express";
import cors from "cors";

// STUB — Búsqueda y filtros del catálogo (HU-09, HU-13, HU-14, HU-15)
// Responsable: Carolina. Reemplazar con la lógica real y conectar a Postgres
// (ver /database/postgres y /docs/api-contract.md para las formas esperadas).

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8004;

app.get("/health", (_req, res) => {
  res.json({ service: "catalogo-service", status: "ok", implemented: false });
});

app.listen(PORT, () => {
  console.log(`[catalogo-service] escuchando en el puerto ${PORT} (stub, pendiente de implementación)`);
});
