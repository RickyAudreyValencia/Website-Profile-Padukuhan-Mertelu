"use client";
// EmptyState (client) - shows when a section has no data. Includes sample images.
export default function EmptyState({ title = 'Belum ada data' }) {
  const samples = [
    'https://images.unsplash.com/photo-1526312426976-6fcf6a5d3b8b?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=60'
  ];

  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-6 text-center">
      <h3 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">Data belum tersedia. Anda bisa menambah data melalui dashboard Supabase.</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {samples.map((s, i) => (
          <img key={i} src={s} alt={`sample-${i}`} className="h-20 w-full rounded-lg object-cover" />
        ))}
      </div>
    </div>
  );
}
