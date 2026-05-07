"use client";
// Footer component (client) - contact details and social links
export default function Footer() {
  return (
    <footer id="kontak" className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[linear-gradient(120deg,#1d3f34,#24372f)] py-8 text-white shadow-[0_12px_34px_rgba(20,31,24,0.22)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
        <div>
          <h4 className="font-[Sora] text-lg font-semibold">Padukuhan Mertelu</h4>
          <p className="mt-2 text-sm text-white/80">Harmoni Alam, Kebersamaan, Kemandirian.</p>
        </div>

        <div>
          <h4 className="font-[Sora] text-lg font-semibold">Kontak</h4>
          <p className="mt-2 text-sm text-white/80">Jl. Desa Mertelu, Yogyakarta</p>
          <p className="text-sm text-white/80">Email: desamertelu@gmail.com</p>
          <p className="text-sm text-white/80">Telp: 08xxxxxxxxxx</p>
        </div>

        <div>
          <h4 className="font-[Sora] text-lg font-semibold">Tautan Cepat</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="#profil" className="rounded-full border border-white/30 px-3 py-1 text-sm text-white/85 hover:bg-white/15">Profil</a>
            <a href="#kegiatan" className="rounded-full border border-white/30 px-3 py-1 text-sm text-white/85 hover:bg-white/15">Kegiatan</a>
            <a href="#galeri" className="rounded-full border border-white/30 px-3 py-1 text-sm text-white/85 hover:bg-white/15">Galeri</a>
          </div>
        </div>
      </div>

      <div className="mx-6 mt-6 border-t border-white/25 pt-5 text-center text-sm text-white/75">© {new Date().getFullYear()} Padukuhan Mertelu. Semua hak dilindungi.</div>
    </footer>
  );
}
