import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

function toSafeBase(name: string) {
  return (name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '').toLowerCase()) || 'file';
}
function toFolderedKey(filename: string) {
  const dot = filename.lastIndexOf('.');
  const base = dot !== -1 ? filename.slice(0, dot) : filename;
  const ext  = dot !== -1 ? filename.slice(dot + 1).toLowerCase() : '';
  const d = new Date(); const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0');
  const ts = Date.now(); const safe = toSafeBase(base);
  return ext ? `${y}/${m}/${ts}_${safe}.${ext}` : `${y}/${m}/${ts}_${safe}`;
}
function guessMime(name: string, provided = '') {
  if (provided) return provided;
  const ext = (name.split('.').pop() || '').toLowerCase();
  const map: Record<string,string> = {
    pdf:'application/pdf', txt:'text/plain', jpg:'image/jpeg', jpeg:'image/jpeg',
    png:'image/png', gif:'image/gif', webp:'image/webp',
    doc:'application/msword',
    docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return map[ext] || 'application/octet-stream';
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const title = (form.get('title') || '').toString().trim();
  const description = (form.get('description') || '').toString().trim();
  const file = form.get('file') as File | null;

  if (!file)   return new Response('No file', { status: 400 });
  if (!title)  return new Response('Title required', { status: 400 });
  if (file.size > 10 * 1024 * 1024) return new Response('Max 10MB', { status: 400 });

  const objectName  = toFolderedKey(file.name);
  const contentType = guessMime(file.name, (file as any).type || '');

  // 1) Subir a Storage (bucket "uploads")
  const { error: upErr } = await supabase
    .storage.from('uploads')
    .upload(objectName, await file.arrayBuffer(), { contentType, upsert: false });
  if (upErr) return new Response('Upload error: ' + upErr.message, { status: 500 });

  // 2) Guardar metadatos en la tabla "files" (SIN public_url)
  const { error: dbErr } = await supabase.from('files').insert({
    object_name: objectName,
    title,
    description,
    size_bytes: file.size,
    content_type: contentType,
  });
  if (dbErr) return new Response('DB error: ' + dbErr.message, { status: 500 });

  // 3) Redirigir
  return redirect('/latest?new=' + encodeURIComponent(objectName));
};
