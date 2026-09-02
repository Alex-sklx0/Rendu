import express from "express";
import cors from "cors";

// STUB — Registro y consulta de empresas (HU-02)
// Responsable: Carolina. Reemplazar con la lógica real y conectar a Postgres
// (ver /database/postgres y /docs/api-contract.md para las formas esperadas).

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8002;

app.get("/health", (_req, res) => {
  res.json({ service: "empresas-service", status: "ok", implemented: false });
});

app.listen(PORT, () => {
  console.log(`[empresas-service] escuchando en el puerto ${PORT} (stub, pendiente de implementación)`);
});
