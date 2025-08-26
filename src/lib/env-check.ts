export const envCheck = {
  url: import.meta.env.PUBLIC_SUPABASE_URL,
  anonStart: import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.slice(0, 12) ?? null,
  anonLen: import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.length ?? null,
};