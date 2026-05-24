"use client";

import { useState } from "react";
import Modal from "./Modal";

export default function Galeri({ items }) {
  const [selected, setSelected] = useState(null);
  const fallback = "https://img.youtube.com/vi/FAAQ8APLvng/maxresdefault.jpg";

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 8).map((g, index) => (
          <button
            key={g.id}
            onClick={() => setSelected(g)}
            className={`group relative min-h-44 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] text-left shadow-[0_10px_26px_rgba(24,35,28,0.08)] transition hover:border-[var(--brand)]/35 ${
              index === 0 ? "sm:col-span-2 sm:row-span-2 sm:min-h-80" : ""
            }`}
          >
            <img src={g.gambar || g.image || fallback} alt={g.judul} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/76 via-black/28 to-transparent p-3 text-white">
              <p className="line-clamp-2 text-sm font-semibold">{g.judul || "Dokumentasi Kegiatan"}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && <Modal src={selected.gambar || selected.image || fallback} alt={selected.judul} onClose={() => setSelected(null)} />}
    </>
  );
}
