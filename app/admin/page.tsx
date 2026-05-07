"use client";

import dynamic from "next/dynamic";

const AdminPanel = dynamic(() => import("../../src/components/AdminPanel"), { ssr: false });

export default function AdminPage() {
  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h1 className="section-title mb-2 text-3xl md:text-4xl">Admin Dashboard</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">Kelola berita, kegiatan, dan galeri padukuhan secara realtime.</p>
        <AdminPanel />
      </div>
    </div>
  );
}