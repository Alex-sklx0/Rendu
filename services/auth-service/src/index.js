import express from "express";
import cors from "cors";

// STUB — Autenticación y usuarios (HU-01)
// Responsable: Carolina. Reemplazar con la lógica real y conectar a Postgres
// (ver /database/postgres y /docs/api-contract.md para las formas esperadas).

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8001;

app.get("/health", (_req, res) => {
  res.json({ service: "auth-service", status: "ok", implemented: false });
});

app.listen(PORT, () => {
  console.log(`[auth-service] escuchando en el puerto ${PORT} (stub, pendiente de implementación)`);
});
