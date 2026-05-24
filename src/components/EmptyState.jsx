"use client";

import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Belum ada data" }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[var(--brand)]">
        <Inbox size={21} />
      </div>
      <h3 className="mt-3 font-[Sora] text-lg font-semibold text-[var(--brand)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">Data akan tampil otomatis setelah pengelola menambahkannya lewat panel admin.</p>
    </div>
  );
}
