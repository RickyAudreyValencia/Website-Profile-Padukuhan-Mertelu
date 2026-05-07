"use client";
// Berita component (client) - displays a responsive grid of news cards

function truncate(text, n = 140) {
  if (!text) return '';
  return text.length > n ? text.slice(0, n) + '…' : text;
}

export default function Berita({ items }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {items.map((b) => (
        <article key={b.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_8px_22px_rgba(24,35,28,0.09)] transition-transform duration-300 hover:-translate-y-1">
          <div className="h-44 w-full overflow-hidden">
            <img
              src={b.gambar || b.image || 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=900&q=80'}
              alt={b.title || b.judul}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">{b.judul || b.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{truncate(b.isi || b.deskripsi)}</p>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              {new Date(b.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
