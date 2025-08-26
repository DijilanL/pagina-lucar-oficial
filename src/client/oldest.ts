import { supabase } from "@/lib/supabase";

function previewHtml(url: string, ct = "") {
  const iframe = (src: string) =>
    `<iframe class="w-full h-full border-0" src="${src}" loading="lazy"></iframe>`;

  if (ct.startsWith("image/")) {
    return `
      <div class="w-full h-full overflow-auto bg-slate-900 flex items-center justify-center">
        <img src="${url}" alt="" class="max-w-none" loading="lazy" />
      </div>`;
  }
  if (ct.includes("pdf")) return iframe(`${url}#view=FitH`);
  if (ct.includes("wordprocessingml") || ct.includes("msword") || ct.includes("officedocument")) {
    const office = "https://view.officeapps.live.com/op/embed.aspx?src=" + encodeURIComponent(url);
    return iframe(office);
  }
  return iframe(url);
}

function card(row: any) {
  const { data: pub } = supabase.storage.from("uploads").getPublicUrl(row.object_name);
  const url = pub.publicUrl;
  const date = new Date(row.created_at).toLocaleString();
  const desc = row.description ? `<p class="mt-3 text-sm text-slate-300">${row.description}</p>` : "";
  const suggestedName = String(row.object_name).replace(/^\d+_/, "");

  return `
    <article class="p-4 rounded-xl bg-slate-800 hover:bg-slate-750 transition">
      <div class="font-semibold truncate mb-1">${row.title}</div>
      <div class="text-xs text-slate-400 mb-2">${date}</div>

      <div class="rounded-lg border border-slate-700 overflow-hidden h-64">
        ${previewHtml(url, row.content_type || "")}
      </div>

      ${desc}

      <div class="mt-3 flex gap-4 text-sm">
        <a class="underline text-blue-400" href="${url}" target="_blank" rel="noopener">Abrir</a>
        <button class="underline text-slate-300" data-action="download" data-path="${row.object_name}" data-name="${suggestedName}">
          Descargar
        </button>
      </div>
    </article>`;
}

async function load(listEl: HTMLElement) {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .order("created_at", { ascending: true }) // más antiguos primero
    .limit(100);

  if (error) {
    listEl.innerHTML = `<p class="text-red-400">Error al listar: ${error.message}</p>`;
    return;
  }
  listEl.innerHTML = (data ?? []).map(card).join("") || "<p>No hay archivos aún.</p>";
}

function wireDownloads(listEl: HTMLElement) {
  listEl.addEventListener("click", async (e) => {
    const btn = (e.target as HTMLElement).closest("[data-action='download']") as HTMLButtonElement | null;
    if (!btn) return;

    const path = btn.getAttribute("data-path")!;
    const name = btn.getAttribute("data-name") || "archivo";

    btn.textContent = "Descargando…";
    btn.disabled = true;

    const { data, error } = await supabase.storage.from("uploads").download(path);
    if (error) {
      btn.textContent = "Descargar";
      btn.disabled = false;
      alert("Error al descargar: " + error.message);
      return;
    }

    const blobUrl = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);

    btn.textContent = "Descargar";
    btn.disabled = false;
  });
}

function init() {
  const listEl = document.getElementById("list");
  if (!listEl) return;
  wireDownloads(listEl);
  load(listEl);
}

window.addEventListener("DOMContentLoaded", init);