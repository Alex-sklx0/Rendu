import express from 'express';
import cors from 'cors';
import { router } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 8000;

// ── Middlewares globales ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ───────────────────────────────────────────────────────────
// Reemplaza los 5 GET /health individuales de los microservicios anteriores
app.get('/health', (_req, res) => {
  res.json({ service: 'rendu-backend', status: 'ok' });
});

// ── Rutas de la API ────────────────────────────────────────────────────────
app.use('/api', router);

// ── Manejo global de errores ───────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[rendu-backend] escuchando en http://localhost:${PORT}`);
});
