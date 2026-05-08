"use client";
// Kegiatan component (client) - cards with hover animation

export default function Kegiatan({ items }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {items.map((k) => (
        <div key={k.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_8px_22px_rgba(24,35,28,0.09)] card-hover-glow">
          <div className="h-48 w-full overflow-hidden">
            <img
              src={k.gambar || k.image || 'https://images.unsplash.com/photo-1522791731139-3f4f7f4f9f3a?auto=format&fit=crop&w=900&q=80'}
              alt={k.judul}
              className="h-full w-full object-cover image-hover-scale"
            />
          </div>
          <div className="p-4">
            <h3 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">{k.judul}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{k.deskripsi}</p>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              {new Date(k.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
