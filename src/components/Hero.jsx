"use client";
// Hero section (client) with background image and CTA

export default function Hero() {
  return (
    <section className="relative mx-auto mt-2 w-full max-w-6xl overflow-hidden rounded-[28px] border border-[var(--line)]">
      <img
        src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=80"
        alt="Hero background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(12,29,22,0.85)] via-[rgba(14,38,29,0.68)] to-[rgba(14,38,29,0.2)]" />

      <div className="relative flex min-h-[46vh] items-center justify-center px-6 py-12 text-center md:min-h-[52vh] md:px-10">
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
    </section>
  );
}
