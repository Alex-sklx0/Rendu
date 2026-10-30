import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { router } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { limiterGeneral } from './middlewares/rateLimit.js';

const app = express();
const produccion = process.env.NODE_ENV === 'production';

// Detrás de un proxy (Render, Railway, etc.) para que req.secure y la IP real funcionen
if (produccion) app.set('trust proxy', 1);

app.use(helmet()); // cabeceras de seguridad (incluye HSTS y oculta X-Powered-By)

// HTTPS obligatorio solo en producción (en local sigue siendo http://localhost)
if (produccion) {
  app.use((req, res, next) => {
    if (req.secure || req.path === '/health') return next();
    return res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
  });
}

// CORS_ORIGINS=https://tu-front.com (varios separados por coma). Sin definir, queda abierto.
const origenes = (process.env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors(origenes.length ? { origin: origenes } : undefined));

app.use('/api', limiterGeneral);
app.use(express.json({ limit: '10mb' })); // las imágenes van en base64 en el body (HU-08)

app.get('/health', (_req, res) => {
  res.json({ service: 'rendu-backend', status: 'ok' });
});

app.use('/api', router);
app.use(errorHandler);

export default app;