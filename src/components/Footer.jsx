"use client";

import { Mail, MapPin, Phone, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer id="kontak" className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--brand)] text-white shadow-[0_18px_50px_rgba(20,31,24,0.2)]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:gap-7 md:grid-cols-[1.2fr_1fr_1fr] md:px-7 md:py-8">
        <div>
          <div className="flex items-center gap-3">
            <img src="/mertelu.png" alt="Logo Padukuhan Mertelu" className="h-12 w-12 rounded-lg bg-white object-contain p-1" />
            <div className="flex flex-col items-start gap-1">
              <h4 className="font-[Sora] text-base font-semibold">Padukuhan Mertelu</h4>
              <p className="text-sm text-white/74">Profil digital masyarakat</p>
            </div>
          </div>
          <p className="mt-3 max-w-sm text-xs leading-5 text-white/78 md:text-sm md:leading-6">Website ini menjadi tempat berbagi kabar, dokumentasi kegiatan, dan informasi padukuhan yang mudah diakses warga.</p>
        </div>

        <div>
          <h4 className="font-[Sora] text-base font-semibold">Kontak</h4>
          <div className="mt-3 space-y-2 text-xs text-white/80 md:text-sm">
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 md:size-4" />
              <span>Mertelu, Kabupaten Gunungkidul, Daerah Istimewa Yogyakarta</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} className="shrink-0 md:size-4" />
              085228614875 (Sukimin)
            </p>
            <a 
              href="https://maps.app.goo.gl/KqkBzJvrBVFBrGo99?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-white/15 px-3 py-2 transition hover:bg-white/25 md:inline-flex"
            >
              <MapPin size={14} className="md:size-4" />
              <span>Lihat di Maps</span>
              <ExternalLink size={12} className="md:size-3.5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-[Sora] text-base font-semibold">Tautan Cepat</h4>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-2">
            {[
              ["Profil", "#profil"],
              ["Berita", "#berita"],
              ["Kegiatan", "#kegiatan"],
              ["Galeri", "#galeri"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="rounded-lg border border-white/18 px-3 py-2 text-center text-xs text-white/86 transition hover:bg-white/10 md:text-sm">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/18 px-4 py-3 text-center text-xs text-white/68 md:px-5 md:py-4">© {new Date().getFullYear()} Padukuhan Mertelu. Semua hak dilindungi.</div>
    </footer>
  );
}