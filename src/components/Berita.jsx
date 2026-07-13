"use client";

import { CalendarDays, X } from "lucide-react";
import { useState } from "react";

function truncate(text, n = 150) {
  if (!text) return "";
  return text.length > n ? `${text.slice(0, n).trim()}...` : text;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

export default function Berita({ items }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [featured, ...rest] = items;
  const fallback = "https://img.youtube.com/vi/FAAQ8APLvng/maxresdefault.jpg";

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        {featured && (
          <article className="overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_14px_34px_rgba(24,35,28,0.08)]">
            <div className="aspect-[16/10] w-full overflow-hidden bg-[var(--surface-soft)] cursor-pointer group">
              <img 
                src={featured.gambar || featured.image || fallback} 
                alt={featured.judul || featured.title} 
                onClick={() => setSelectedImage(featured.gambar || featured.image || fallback)}
                className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <div className="p-4 md:p-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand)]">
                <CalendarDays size={14} />
                {formatDate(featured.created_at)}
              </div>
              <h3 className="font-[Sora] text-xl font-semibold leading-snug text-[var(--foreground)] md:text-2xl">{featured.judul || featured.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{truncate(featured.isi || featured.deskripsi, 220)}</p>
            </div>
          </article>
        )}

        <div className="grid gap-3">
          {(rest.length ? rest : items.slice(1)).slice(0, 4).map((b) => (
            <article key={b.id} className="grid grid-cols-[92px_1fr] gap-3 rounded-lg border border-[var(--line)] bg-white p-3 transition hover:border-[var(--brand)]/30 hover:bg-[var(--surface-soft)] sm:grid-cols-[124px_1fr]">
              <div 
                className="h-24 overflow-hidden rounded-md bg-[var(--surface-soft)] cursor-pointer group sm:h-28"
                onClick={() => setSelectedImage(b.gambar || b.image || fallback)}
              >
                <img 
                  src={b.gambar || b.image || fallback} 
                  alt={b.title || b.judul} 
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="min-w-0">
                <h3 className="line-clamp-2 font-[Sora] text-sm font-semibold leading-snug text-[var(--foreground)] sm:text-base">{b.judul || b.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--muted)] sm:text-sm">{truncate(b.isi || b.deskripsi, 100)}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--accent)]">
                  <CalendarDays size={13} />
                  {formatDate(b.created_at)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal Foto */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl w-full rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-white/20 p-2 hover:bg-white/30 transition"
            >
              <X size={24} className="text-white" />
            </button>
            <img 
              src={selectedImage} 
              alt="Foto" 
              className="h-full w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
