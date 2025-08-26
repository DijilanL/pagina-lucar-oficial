import { createClient } from "@supabase/supabase-js";

const url  = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // Esto te dirá qué falta
  console.error("Faltan variables PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY");
  throw new Error("Variables de entorno faltantes");
}

export const supabase = createClient(url, anon);