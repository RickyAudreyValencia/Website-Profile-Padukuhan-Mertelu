"use client";

import { useEffect, useState } from "react";
import { Building2, Home, Store, Users } from "lucide-react";

function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const duration = 1200;
    const start = performance.now();
    let frameId;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <span>{Number(count).toLocaleString("id-ID")}</span>;
}

export default function Stats({ stats }) {
  const safeStats = stats || { penduduk: 0, dusun: 0, umkm: 0, rtrw: 0 };

  const items = [
    { label: "Penduduk", value: parseInt(safeStats.penduduk) || 0, suffix: "jiwa", icon: Users },
    { label: "Dusun", value: parseInt(safeStats.dusun) || 0, suffix: "wilayah", icon: Home },
    { label: "UMKM", value: parseInt(safeStats.umkm) || 0, suffix: "unit", icon: Store },
    { label: "RT / RW", value: parseInt(safeStats.rtrw) || 0, suffix: "lingkungan", icon: Building2 },
  ];

  return (
    <section className="fade-up mt-6 rounded-lg border border-[var(--line)] bg-white p-4 shadow-[0_16px_40px_rgba(31,43,36,0.07)] md:mt-8 md:p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--muted)]">{item.label}</p>
                  <p className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1 text-3xl font-semibold leading-none text-[var(--brand)]">
                    <AnimatedCounter value={item.value} />
                    <span className="pb-1 text-xs font-semibold text-[var(--muted)]">{item.suffix}</span>
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--brand)]">
                  <Icon size={20} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
