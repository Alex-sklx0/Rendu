try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  } else {
    await import('dotenv/config');
  }
} catch {
  // Ignorar si no existe archivo .env o las variables vienen inyectadas por Docker
}

import app from './src/app.js';

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});