// src/pages/api/files.ts
import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

const USE_SIGNED_URLS = false;
const SIGNED_TTL_SECONDS = 3600;

export const GET: APIRoute = async ({ url }) => {
  const order = (url.searchParams.get('order') || 'desc').toLowerCase();
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500);

  const { data, error } = await supabase
    .from('files').select('*')
    .order('created_at', { ascending: order === 'asc' })
    .limit(limit);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const rows = data ?? [];
  const enriched = await Promise.all(rows.map(async (row: any) => {
    const path = row.object_name as string;
    if (!path) return { ...row, public_url: null };
    if (USE_SIGNED_URLS) {
      const { data: s, error: se } = await supabase.storage.from('uploads').createSignedUrl(path, SIGNED_TTL_SECONDS);
      return { ...row, public_url: se ? null : (s?.signedUrl ?? null) };
    } else {
      const { data: pub } = supabase.storage.from('uploads').getPublicUrl(path);
      return { ...row, public_url: pub?.publicUrl ?? null };
    }
  }));

  return new Response(JSON.stringify(enriched), { headers: { 'Content-Type': 'application/json' } });
};