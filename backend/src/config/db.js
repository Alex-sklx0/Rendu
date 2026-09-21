import pg from 'pg';

const { Pool } = pg;

// Conexión a Postgres usando DATABASE_URL del entorno
// En desarrollo local: postgresql://rendu:rendu@postgres:5432/rendu
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
