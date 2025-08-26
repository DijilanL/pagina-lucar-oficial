import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url  = import.meta.env.PUBLIC_SUPABASE_URL!;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

declare global {
  // eslint-disable-next-line no-var
  var __sb: SupabaseClient | undefined;
}

export const supabase = globalThis.__sb ??= createClient(url, anon);