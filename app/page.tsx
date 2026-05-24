import { supabase } from "../src/lib/supabase";
import Hero from "../src/components/Hero";
import LiveHomepage from "../src/components/LiveHomepage";
import Footer from "../src/components/Footer";
import { HeartHandshake, Leaf, Sprout } from "lucide-react";

const profileCards = [
  {
    title: "Kebersamaan",
    text: "Gotong royong menjadi cara warga menyelesaikan banyak hal.",
    Icon: HeartHandshake,
  },
  {
    title: "Lingkungan",
    text: "Ruang hidup dijaga lewat kegiatan dan kepedulian harian.",
    Icon: Leaf,
  },
  {
    title: "Kemandirian",
    text: "Potensi warga, UMKM, dan kegiatan lokal terus ditumbuhkan.",
    Icon: Sprout,
  },
];

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
        penduduk: parseInt(data.jumlah_penduduk) || 0,
        dusun: parseInt(data.jumlah_dusun) || 0,
        umkm: parseInt(data.jumlah_umkm) || 0,
        rtrw: parseInt(data.jumlah_rt_rw) || 0,
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
        <section id="profil" className="fade-up mb-6 rounded-lg border border-[var(--line)] bg-white p-5 shadow-[0_16px_44px_rgba(31,43,36,0.07)] md:p-7">
          <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <p className="section-kicker">Profil Padukuhan</p>
              <h2 className="section-title mt-2 text-2xl md:text-4xl">Mengenal Padukuhan Mertelu</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)] md:text-base md:leading-8">
                Mertelu tumbuh dari kebiasaan saling mengenal, bekerja bersama, dan menjaga lingkungan sekitar. Website ini dibuat sebagai ruang informasi yang dekat dengan warga, mudah diperbarui, dan tetap terasa sederhana.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {profileCards.map(({ title, text, Icon }) => (
                  <article key={title} className="rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--brand)]">
                        <Icon size={19} />
                      </div>
                      <div>
                        <h3 className="font-[Sora] text-base font-semibold text-[var(--foreground)]">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{text}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface-soft)]">
              <div className="p-4 md:p-5">
                <h3 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Dokumentasi Padukuhan</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Profil dan suasana Padukuhan Mertelu dapat dilihat lewat dokumentasi video berikut.</p>
              </div>
              <div className="aspect-video w-full overflow-hidden bg-black">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/FAAQ8APLvng"
                title="Padukuhan Mertelu"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
              />
              </div>
            </div>
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
