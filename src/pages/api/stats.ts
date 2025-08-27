import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const GET: APIRoute = async () => {
  // Contar filas (sin traerlas)
  const { count, error: countErr } = await supabase
    .from('files')
    .select('*', { count: 'exact', head: true });

  if (countErr) {
    return new Response(JSON.stringify({ error: countErr.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Sumar tamaños y obtener "último"
  const { data, error: sumErr } = await supabase
    .from('files')
    .select('size_bytes,created_at');

  if (sumErr) {
    return new Response(JSON.stringify({ error: sumErr.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const bytes = (data ?? []).reduce((a, b) => a + (b.size_bytes || 0), 0);
  const last = (data ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0]?.created_at ?? null;

  return new Response(JSON.stringify({ total: count ?? 0, bytes, last }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
