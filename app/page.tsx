import { supabase } from "../src/lib/supabase";
import Hero from "../src/components/Hero";
import LiveHomepage from "../src/components/LiveHomepage";
import Footer from "../src/components/Footer";

async function fetchTable(table: string) {
  try {
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (error) {
      console.error(`Supabase error (${table}):`, error);
      return null;
    }
    return data || [];
  } catch (error) {
    console.error(`Fetch error (${table}):`, error);
    return null;
  }
}

async function fetchStats() {
  try {
    const { data, error } = await supabase.from("statistik").select("*").single();
    if (error && error.code !== "PGRST116") {
      console.error("Supabase error (statistik):", error);
      return { penduduk: 0, dusun: 0, umkm: 0, rtrw: 0 };
    }
    // Map database fields to app fields
    if (data) {
      return {
        penduduk: data.jumlah_penduduk || 0,
        dusun: data.jumlah_dusun || 0,
        umkm: data.jumlah_umkm || 0,
        rtrw: data.jumlah_rt_rw || 0,
      };
    }
    return { penduduk: 0, dusun: 0, umkm: 0, rtrw: 0 };
  } catch (error) {
    console.error("Fetch error (statistik):", error);
    return { penduduk: 0, dusun: 0, umkm: 0, rtrw: 0 };
  }
}

export default async function Home() {
  const [berita, kegiatan, galeri, stats] = await Promise.all([
    fetchTable("berita"),
    fetchTable("kegiatan"),
    fetchTable("galeri"),
    fetchStats(),
  ]);

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <section id="profil" className="section-wrap fade-up mb-6 p-6 md:p-8">
          <p className="section-kicker">Profil Padukuhan</p>
          <h2 className="section-title mt-2 text-2xl md:text-3xl">Mengenal Padukuhan Mertelu</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
            Padukuhan Mertelu dikenal sebagai wilayah yang menjaga nilai kebersamaan, budaya gotong royong, dan semangat kemandirian warga.
            Melalui website ini, informasi publik disajikan lebih terbuka dan mudah diakses.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <h3 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Sejarah Singkat</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Bertumbuh dari komunitas agraris yang kuat, Mertelu berkembang menjadi padukuhan yang adaptif dan aktif dalam kegiatan sosial.</p>
            </article>
            <article className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <h3 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Visi</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Menjadi padukuhan mandiri, sehat, dan produktif dengan pelayanan publik yang transparan serta berbasis partisipasi warga.</p>
            </article>
            <article className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <h3 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Misi</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Menguatkan UMKM lokal, meningkatkan kualitas lingkungan, dan mendorong kolaborasi antarwarga di setiap program padukuhan.</p>
            </article>
          </div>
        </section>

        <LiveHomepage
          initialBerita={berita || []}
          initialKegiatan={kegiatan || []}
          initialGaleri={galeri || []}
          initialStats={stats}
        />

        <div className="mt-8">
          <Footer />
        </div>
      </div>
    </>
  );
}
