"use client";
// Hero section (client) with image carousel

import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1800&q=80",
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 2000); // Ganti gambar setiap 2 detik

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
  };

  return (
    <section className="relative mx-auto mt-2 w-full max-w-6xl overflow-hidden rounded-[28px] border border-[var(--line)]">
      {/* Carousel */}
      <div className="relative h-[46vh] md:h-[52vh] overflow-hidden">
        {HERO_IMAGES.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Hero slide ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(12,29,22,0.85)] via-[rgba(14,38,29,0.68)] to-[rgba(14,38,29,0.2)]" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center px-6 py-12 text-center md:px-10">
          <div className="max-w-3xl text-white">
            <p className="section-kicker text-white/80">Website Resmi Padukuhan</p>
            <h1 className="mt-3 font-[Sora] text-3xl font-bold leading-tight md:text-5xl">
              Padukuhan Mertelu
              <span className="mt-2 block text-base font-medium text-white/80 md:text-xl">Harmoni Alam, Kebersamaan, dan Kemajuan</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
              Ruang informasi untuk warga dan pengunjung. Temukan profil padukuhan, kegiatan terbaru, dokumentasi galeri, serta data singkat yang terus diperbarui.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href="#kegiatan" className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(9,16,12,0.32)] hover:opacity-90">Jelajahi Kegiatan</a>
              <a href="#profil" className="rounded-xl border border-white/50 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">Lihat Profil</a>
              <a href="#galeri" className="rounded-xl border border-white/20 bg-black/20 px-5 py-3 text-sm font-semibold text-white hover:bg-black/30">Buka Galeri</a>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 hidden w-[230px] rounded-2xl border border-white/30 bg-black/30 p-3 text-white backdrop-blur md:block">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Sorotan</p>
            <p className="mt-1 text-xs leading-relaxed">Padukuhan yang menjaga tradisi sambil bergerak maju bersama teknologi.</p>
          </div>
        </div>

        {/* Prev Button */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 transition md:h-12 md:w-12"
          aria-label="Gambar sebelumnya"
        >
          <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 transition md:h-12 md:w-12"
          aria-label="Gambar berikutnya"
        >
          <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-6"
                  : "bg-white/50 w-2 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
