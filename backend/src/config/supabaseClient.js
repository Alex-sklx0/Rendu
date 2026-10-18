import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Faltan variables de entorno: revisa que SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY esten en tu archivo .env'
  );
}

// Este cliente se usa desde el backend (server-side), por eso usamos la
// service_role key y NO la anon key: el backend necesita permisos para
// insertar/leer sin las restricciones de Row Level Security pensadas
// para el navegador. Esta key NUNCA debe exponerse al frontend.
export const supabase = createClient(supabaseUrl, supabaseKey);