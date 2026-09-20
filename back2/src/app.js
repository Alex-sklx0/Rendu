import express from 'express';
import cors from 'cors';

import { router } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // límite más alto: las imágenes van en base64 en el body (HU-08)

app.get('/health', (_req, res) => {
  res.json({ service: 'rendu-backend', status: 'ok' });
});

app.use('/api', router);
app.use(errorHandler);

export default app;