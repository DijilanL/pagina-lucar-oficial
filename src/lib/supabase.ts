import { createClient } from '@supabase/supabase-js';

// SDK en el servidor (no persiste sesión en serverless)
export const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);