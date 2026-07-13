"use client";

import { useEffect, useState } from "react";
import { ArrowDown, Image as ImageIcon, MapPin } from "lucide-react";

const HERO_IMAGES = [
  {
    src: "https://img.youtube.com/vi/FAAQ8APLvng/maxresdefault.jpg",
    alt: "Suasana dokumentasi Padukuhan Mertelu",
  },
  {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
    alt: "Pemandangan perbukitan dan permukiman desa",
  },
  {
    src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=80",
    alt: "Lanskap sawah dan suasana pedesaan",
  },
  {
    src: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1800&q=80",
    alt: "Hamparan hijau wilayah pertanian",
  },
];

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_IMAGES.length);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="beranda" className="relative isolate mt-3 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative min-h-[640px] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--brand)] shadow-[0_22px_70px_rgba(20,31,24,0.22)] sm:min-h-[600px] md:min-h-[620px]">
          {HERO_IMAGES.map((image, index) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-out ${
                index === activeSlide ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,24,18,0.88),rgba(18,48,36,0.62)_48%,rgba(18,48,36,0.2))]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent" />

          <div className="relative flex min-h-[640px] flex-col justify-between px-5 py-6 text-white sm:min-h-[600px] sm:px-8 md:min-h-[620px] md:px-10 md:py-9">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2 backdrop-blur">
                <MapPin size={14} />
                GunungKidul, Yogyakarta
              </span>
              <span className="rounded-lg border border-white/20 bg-black/20 px-3 py-2 backdrop-blur">Profil dan kabar warga</span>
            </div>

            <div className="max-w-3xl pb-4 pt-12 md:pb-12">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Website Padukuhan</p>
              <h1 className="mt-4 max-w-[12ch] font-[Sora] text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-7xl">
                Mertelu yang tumbuh bersama warganya.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/86 md:text-lg">
                Ruang sederhana untuk mengenal profil padukuhan, mengikuti kabar terbaru, melihat kegiatan warga, dan menyimpan dokumentasi yang terus diperbarui.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#profil"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[var(--brand)] shadow-[0_14px_34px_rgba(0,0,0,0.2)] transition hover:bg-[var(--surface-soft)]"
                >
                  <ArrowDown size={17} />
                  Mengenal Mertelu
                </a>
                <a
                  href="#galeri"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/25 bg-black/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/30"
                >
                  <ImageIcon size={17} />
                  Lihat Galeri
                </a>
              </div>
            </div>

            <div className="grid gap-2 text-sm text-white/84 sm:grid-cols-3">
              {["Informasi publik", "Kegiatan warga", "Dokumentasi padukuhan"].map((item) => (
                <div key={item} className="rounded-lg border border-white/18 bg-black/22 px-4 py-3 backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-5 right-5 z-10 hidden items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-2 backdrop-blur sm:flex">
            {HERO_IMAGES.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Tampilkan gambar ${index + 1}`}
                className={`h-2 rounded-full transition-all ${index === activeSlide ? "w-7 bg-white" : "w-2 bg-white/45 hover:bg-white/75"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
