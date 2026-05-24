"use client";

import { CalendarDays } from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

export default function Kegiatan({ items }) {
  const fallback = "https://img.youtube.com/vi/FAAQ8APLvng/maxresdefault.jpg";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.slice(0, 6).map((k) => (
        <article key={k.id} className="overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_12px_30px_rgba(24,35,28,0.07)]">
          <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--surface-soft)]">
            <img src={k.gambar || k.image || fallback} alt={k.judul} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
          </div>
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[var(--accent)]">
              <CalendarDays size={14} />
              {formatDate(k.created_at)}
            </div>
            <h3 className="line-clamp-2 font-[Sora] text-lg font-semibold leading-snug text-[var(--foreground)]">{k.judul}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{k.deskripsi}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
