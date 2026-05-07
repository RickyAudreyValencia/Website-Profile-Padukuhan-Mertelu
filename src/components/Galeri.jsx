"use client";
// Galeri component (client) - responsive image grid with preview modal
import { useState } from 'react';
import Modal from './Modal';

export default function Galeri({ items }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelected(g)}
            className="group relative overflow-hidden rounded-2xl border border-[var(--line)] shadow-[0_8px_22px_rgba(24,35,28,0.09)]"
          >
            <img
              src={g.gambar || g.image || 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=900&q=80'}
              alt={g.judul}
              className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 py-2 text-left text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {g.judul || 'Dokumentasi Kegiatan'}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <Modal src={selected.gambar || selected.image} alt={selected.judul} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
