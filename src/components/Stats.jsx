// Stats component (server) - displays village statistics fetched from Supabase
'use client';

import { useEffect, useState } from 'react';

function AnimatedCounter({ value, suffix }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!value || value === 0) {
      setCount(0);
      return;
    }
    
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      current = Math.floor(stepValue * stepCount);
      
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]); // Re-run whenever value changes

  return (
    <div className="flex items-end gap-2">
      <span className="text-3xl font-bold leading-none text-[var(--brand)] md:text-4xl counter-value">
        {Number(count).toLocaleString('id-ID')}
      </span>
      <span className="pb-1 text-xs font-medium text-[var(--muted)]">{suffix}</span>
    </div>
  );
}

export default function Stats({ stats }) {
  // stats: { penduduk, dusun, umkm, rtrw }
  const safeStats = stats || { penduduk: 0, dusun: 0, umkm: 0, rtrw: 0 };
  
  const items = [
    { label: 'Penduduk', value: parseInt(safeStats.penduduk) || 0, suffix: 'jiwa' },
    { label: 'Dusun', value: parseInt(safeStats.dusun) || 0, suffix: 'wilayah' },
    { label: 'UMKM', value: parseInt(safeStats.umkm) || 0, suffix: 'unit' },
    { label: 'RT / RW', value: parseInt(safeStats.rtrw) || 0, suffix: 'lingkungan' },
  ];

  return (
    <section className="section-wrap fade-up mt-8 p-5 md:p-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {items.map((it, idx) => (
          <div
            key={it.label}
            className="stat-card overflow-hidden rounded-2xl border border-[var(--line)] p-4 md:p-5"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">{it.label}</div>
            <div className="mt-2">
              <AnimatedCounter value={it.value} suffix={it.suffix} />
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
