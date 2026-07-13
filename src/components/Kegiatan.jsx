"use client";

import { CalendarDays, X } from "lucide-react";
import { useState } from "react";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

export default function Kegiatan({ items }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const fallback = "https://img.youtube.com/vi/FAAQ8APLvng/maxresdefault.jpg";

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.slice(0, 6).map((k) => (
          <article key={k.id} className="overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_12px_30px_rgba(24,35,28,0.07)]">
            <div 
              className="aspect-[4/3] w-full overflow-hidden bg-[var(--surface-soft)] cursor-pointer group"
              onClick={() => setSelectedImage(k.gambar || k.image || fallback)}
            >
              <img 
                src={k.gambar || k.image || fallback} 
                alt={k.judul} 
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
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
