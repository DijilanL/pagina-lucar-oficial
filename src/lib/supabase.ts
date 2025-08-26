// src/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url  = import.meta.env.PUBLIC_SUPABASE_URL;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (import.meta.env.DEV && (!url || !anon)) {
  console.warn("[supabase] Faltan PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY");
}

// Reutiliza una única instancia en el mismo contexto del navegador
const g = globalThis as unknown as { __sb?: SupabaseClient };

export const supabase =
  g.__sb ??= createClient(url!, anon!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // storageKey: (por defecto ya usa sb-<projectRef>-auth-token)
    },
  });
