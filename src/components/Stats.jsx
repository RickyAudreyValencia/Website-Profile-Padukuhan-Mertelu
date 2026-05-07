// Stats component (server) - displays village statistics fetched from Supabase
export default function Stats({ stats }) {
  // stats: { penduduk, dusun, umkm, rtrw }
  const items = [
    { label: 'Penduduk', value: stats.penduduk || 0, suffix: 'jiwa' },
    { label: 'Dusun', value: stats.dusun || 0, suffix: 'wilayah' },
    { label: 'UMKM', value: stats.umkm || 0, suffix: 'unit' },
    { label: 'RT / RW', value: stats.rtrw || 0, suffix: 'lingkungan' },
  ];

  return (
    <section className="section-wrap fade-up mt-8 p-5 md:p-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {items.map((it) => (
          <div key={it.label} className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm md:p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">{it.label}</div>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold leading-none text-[var(--brand)] md:text-4xl">{Number(it.value).toLocaleString('id-ID')}</span>
              <span className="pb-1 text-xs font-medium text-[var(--muted)]">{it.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-[var(--muted)]">
        Data ditampilkan otomatis dari basis data Supabase.
      </div>
    </section>
  );
}
