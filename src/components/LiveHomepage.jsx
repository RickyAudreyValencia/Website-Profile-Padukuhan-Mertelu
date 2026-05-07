"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";
import Stats from "./Stats";
import Berita from "./Berita";
import Kegiatan from "./Kegiatan";
import Galeri from "./Galeri";
import EmptyState from "./EmptyState";

async function fetchTable(table) {
  const { data, error } = await supabaseBrowser
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function fetchCount(table) {
  const { count } = await supabaseBrowser.from(table).select("id", { count: "exact", head: true });
  return count || 0;
}

export default function LiveHomepage({ initialBerita, initialKegiatan, initialGaleri, initialStats }) {
  const [berita, setBerita] = useState(initialBerita);
  const [kegiatan, setKegiatan] = useState(initialKegiatan);
  const [galeri, setGaleri] = useState(initialGaleri);
  const [stats, setStats] = useState(initialStats);
  const [errorState, setErrorState] = useState({ berita: false, kegiatan: false, galeri: false });

  async function fetchHomepageData() {
    const [nextBerita, nextKegiatan, nextGaleri, penduduk, dusun, umkm, rtrw] = await Promise.all([
      fetchTable("berita"),
      fetchTable("kegiatan"),
      fetchTable("galeri"),
      fetchCount("penduduk"),
      fetchCount("dusun"),
      fetchCount("umkm"),
      fetchCount("rtrw"),
    ]);

    return {
      berita: nextBerita,
      kegiatan: nextKegiatan,
      galeri: nextGaleri,
      stats: { penduduk, dusun, umkm, rtrw },
    };
  }

  useEffect(() => {
    let mounted = true;

    fetchHomepageData()
      .then((nextData) => {
        if (!mounted) return;
        setBerita(nextData.berita);
        setKegiatan(nextData.kegiatan);
        setGaleri(nextData.galeri);
        setStats(nextData.stats);
      })
      .catch((error) => {
        console.error("Realtime initial load error", error);
      });

    async function handleRealtimeReload() {
      try {
        const nextData = await fetchHomepageData();
        if (!mounted) return;
        setBerita(nextData.berita);
        setKegiatan(nextData.kegiatan);
        setGaleri(nextData.galeri);
        setStats(nextData.stats);
        setErrorState({ berita: false, kegiatan: false, galeri: false });
      } catch (error) {
        console.error("Realtime reload error", error);
      }
    }

    const contentChannel = supabaseBrowser
      .channel("public-content-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "berita" }, handleRealtimeReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "kegiatan" }, handleRealtimeReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "galeri" }, handleRealtimeReload)
      .subscribe();

    const statsChannel = supabaseBrowser
      .channel("public-stats-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "penduduk" }, handleRealtimeReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "dusun" }, handleRealtimeReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "umkm" }, handleRealtimeReload)
      .on("postgres_changes", { event: "*", schema: "public", table: "rtrw" }, handleRealtimeReload)
      .subscribe();

    return () => {
      mounted = false;
      supabaseBrowser.removeChannel(contentChannel);
      supabaseBrowser.removeChannel(statsChannel);
    };
  }, []);

  return (
    <>
      <Stats stats={stats} />

      <section id="berita" className="section-wrap fade-up mt-8 p-6 md:p-8">
        <p className="section-kicker">Informasi</p>
        <h2 className="section-title mt-2 mb-6 text-2xl md:text-3xl">Berita Terbaru</h2>
        {errorState.berita ? (
          <EmptyState title="Gagal memuat berita" />
        ) : berita.length === 0 ? (
          <EmptyState title="Belum ada berita" />
        ) : (
          <Berita items={berita} />
        )}
      </section>

      <section id="kegiatan" className="section-wrap fade-up mt-8 p-6 md:p-8">
        <p className="section-kicker">Aktivitas</p>
        <h2 className="section-title mt-2 mb-6 text-2xl md:text-3xl">Kegiatan Padukuhan</h2>
        {errorState.kegiatan ? (
          <EmptyState title="Gagal memuat kegiatan" />
        ) : kegiatan.length === 0 ? (
          <EmptyState title="Belum ada kegiatan" />
        ) : (
          <Kegiatan items={kegiatan} />
        )}
      </section>

      <section id="galeri" className="section-wrap fade-up mt-8 p-6 md:p-8">
        <p className="section-kicker">Dokumentasi</p>
        <h2 className="section-title mt-2 mb-6 text-2xl md:text-3xl">Galeri Kegiatan</h2>
        {errorState.galeri ? (
          <EmptyState title="Gagal memuat galeri" />
        ) : galeri.length === 0 ? (
          <EmptyState title="Belum ada foto di galeri" />
        ) : (
          <Galeri items={galeri} />
        )}
      </section>
    </>
  );
}
