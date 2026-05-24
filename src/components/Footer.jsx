"use client";

import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer id="kontak" className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--brand)] text-white shadow-[0_18px_50px_rgba(20,31,24,0.2)]">
      <div className="mx-auto grid max-w-6xl gap-7 px-5 py-8 md:grid-cols-[1.2fr_1fr_1fr] md:px-7">
        <div>
          <div className="flex items-center gap-3">
            <img src="/mertelu.png" alt="Logo Padukuhan Mertelu" className="h-12 w-12 rounded-lg bg-white object-contain p-1" />
            <div>
              <h4 className="font-[Sora] text-lg font-semibold">Padukuhan Mertelu</h4>
              <p className="text-sm text-white/74">Profil digital masyarakat</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/78">Website ini menjadi tempat berbagi kabar, dokumentasi kegiatan, dan informasi padukuhan yang mudah diakses warga.</p>
        </div>

        <div>
          <h4 className="font-[Sora] text-base font-semibold">Kontak</h4>
          <div className="mt-3 space-y-2 text-sm text-white/80">
            <p className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              Jl. Desa Mertelu, Yogyakarta
            </p>
            <p className="flex items-center gap-2">
              <Mail size={16} />
              desamertelu@gmail.com
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} />
              08xxxxxxxxxx
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-[Sora] text-base font-semibold">Tautan Cepat</h4>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["Profil", "#profil"],
              ["Berita", "#berita"],
              ["Kegiatan", "#kegiatan"],
              ["Galeri", "#galeri"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="rounded-lg border border-white/18 px-3 py-2 text-center text-sm text-white/86 transition hover:bg-white/10">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/18 px-5 py-4 text-center text-xs text-white/68">© {new Date().getFullYear()} Padukuhan Mertelu. Semua hak dilindungi.</div>
    </footer>
  );
}
