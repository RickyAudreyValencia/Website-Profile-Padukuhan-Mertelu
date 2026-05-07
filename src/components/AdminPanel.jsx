"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";
import { useAuth } from "../context/AuthContext";
import { useToast, ToastContainer } from "./Toast";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "galeri";

const CONTENT_CONFIG = {
  berita: {
    label: "Berita",
    titleField: "judul",
    descriptionField: "isi",
    imageField: "gambar",
  },
  kegiatan: {
    label: "Kegiatan",
    titleField: "judul",
    descriptionField: "deskripsi",
    imageField: "gambar",
  },
  galeri: {
    label: "Galeri",
    titleField: "judul",
    descriptionField: null,
    imageField: "gambar",
  },
};

const TABLES = Object.keys(CONTENT_CONFIG);

function getStoragePathFromPublicUrl(url) {
  if (!url) return null;
  const marker = `/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0]);
}

async function fetchRows(table) {
  const { data, error } = await supabaseBrowser.from(table).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function fetchStats() {
  const { data, error } = await supabaseBrowser.from("statistik").select("*").single();
  if (error && error.code !== "PGRST116") throw error;
  // Map database fields to app fields
  if (data) {
    return {
      id: data.id,
      penduduk: data.jumlah_penduduk || 0,
      dusun: data.jumlah_dusun || 0,
      umkm: data.jumlah_umkm || 0,
      rtrw: data.jumlah_rt_rw || 0,
      created_at: data.created_at,
    };
  }
  return { penduduk: 0, dusun: 0, umkm: 0, rtrw: 0 };
}

async function fetchDashboardData() {
  const [berita, kegiatan, galeri, stats] = await Promise.all([
    fetchRows("berita"),
    fetchRows("kegiatan"),
    fetchRows("galeri"),
    fetchStats().catch(() => ({ penduduk: 0, dusun: 0, umkm: 0, rtrw: 0 })),
  ]);

  return {
    lists: { berita, kegiatan, galeri },
    counts: {
      berita: berita.length,
      kegiatan: kegiatan.length,
      galeri: galeri.length,
    },
    stats,
  };
}

export default function AdminPanel() {
  const { user, signOut } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const [activeType, setActiveType] = useState("galeri");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [lists, setLists] = useState({ berita: [], kegiatan: [], galeri: [] });
  const [counts, setCounts] = useState({ berita: 0, kegiatan: 0, galeri: 0 });
  const [stats, setStats] = useState({ penduduk: 0, dusun: 0, umkm: 0, rtrw: 0 });
  const [statsEditing, setStatsEditing] = useState(false);
  const [tempStats, setTempStats] = useState({ ...stats });
  const [busy, setBusy] = useState(false);

  const currentConfig = CONTENT_CONFIG[activeType];

  const activeItems = useMemo(() => {
    return lists[activeType] || [];
  }, [activeType, lists]);

  async function reloadDashboard() {
    try {
      const data = await fetchDashboardData();
      setLists(data.lists);
      setCounts(data.counts);
      setStats(data.stats);
      setTempStats(data.stats);
    } catch (error) {
      console.error("Reload dashboard error", error);
    }
  }

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    fetchDashboardData()
      .then((data) => {
        if (!mounted) return;
        setLists(data.lists);
        setCounts(data.counts);
        setStats(data.stats);
        setTempStats(data.stats);
      })
      .catch((error) => {
        console.error("Initial dashboard load error", error);
      });

    const channel = supabaseBrowser
      .channel("admin-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "berita" }, reloadDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "kegiatan" }, reloadDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "galeri" }, reloadDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "statistik" }, reloadDashboard)
      .subscribe();

    return () => {
      mounted = false;
      supabaseBrowser.removeChannel(channel);
    };
  }, [user]);

  async function handleSignIn(event) {
    event.preventDefault();
    setBusy(true);

    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    setBusy(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("Login berhasil", "success");
  }

  async function handleSignOut() {
    await signOut();
    showToast("Logout berhasil", "success");
  }

  function handleImageChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  async function uploadImageIfAny() {
    if (!file) return null;

    const cleanFileName = file.name.replace(/\s+/g, "-").toLowerCase();
    const filePath = `${activeType}/${Date.now()}-${cleanFileName}`;

    const { error: uploadError } = await supabaseBrowser.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabaseBrowser.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return publicData?.publicUrl || null;
  }

  async function deleteOldImage(imageUrl) {
    if (!imageUrl) return;
    const storagePath = getStoragePathFromPublicUrl(imageUrl);
    if (storagePath) {
      await supabaseBrowser.storage.from(STORAGE_BUCKET).remove([storagePath]);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setTitle(item[currentConfig.titleField] || "");
    setDescription(currentConfig.descriptionField ? item[currentConfig.descriptionField] || "" : "");
    setFile(null);
    setImagePreview(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFile(null);
    setImagePreview(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) {
      showToast("Judul wajib diisi", "error");
      return;
    }

    setBusy(true);

    try {
      let imageUrl = null;
      const editingItem = activeItems.find((item) => item.id === editingId);

      if (file) {
        imageUrl = await uploadImageIfAny();
        if (editingItem && editingItem[currentConfig.imageField]) {
          await deleteOldImage(editingItem[currentConfig.imageField]);
        }
      }

      const payload = {
        [currentConfig.titleField]: title.trim(),
      };

      if (currentConfig.descriptionField) {
        payload[currentConfig.descriptionField] = description.trim();
      }

      if (imageUrl) {
        payload[currentConfig.imageField] = imageUrl;
      }

      let error;
      if (editingId) {
        const result = await supabaseBrowser.from(activeType).update(payload).eq("id", editingId);
        error = result.error;
      } else {
        const result = await supabaseBrowser.from(activeType).insert([payload]);
        error = result.error;
      }

      if (error) throw error;

      const action = editingId ? "diperbarui" : "ditambahkan";
      showToast(`${currentConfig.label} berhasil ${action}`, "success");
      setTitle("");
      setDescription("");
      setFile(null);
      setImagePreview(null);
      setEditingId(null);
      await reloadDashboard();
    } catch (error) {
      console.error("Submit error", error);
      showToast(error.message || "Gagal menyimpan data", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    setBusy(true);

    try {
      const imageUrl = item[currentConfig.imageField];
      if (imageUrl) {
        await deleteOldImage(imageUrl);
      }

      const { error } = await supabaseBrowser.from(activeType).delete().eq("id", item.id);
      if (error) throw error;

      showToast(`${currentConfig.label} berhasil dihapus`, "success");
      await reloadDashboard();
    } catch (error) {
      console.error("Delete error", error);
      showToast(error.message || "Gagal menghapus data", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveStats() {
    setBusy(true);
    try {
      const existing = await supabaseBrowser.from("statistik").select("id").single();
      let error;

      // Map app fields to database fields
      const dbPayload = {
        jumlah_penduduk: tempStats.penduduk,
        jumlah_dusun: tempStats.dusun,
        jumlah_umkm: tempStats.umkm,
        jumlah_rt_rw: tempStats.rtrw,
      };

      if (existing.data) {
        const result = await supabaseBrowser.from("statistik").update(dbPayload).eq("id", existing.data.id);
        error = result.error;
      } else {
        const result = await supabaseBrowser.from("statistik").insert([dbPayload]);
        error = result.error;
      }

      if (error) throw error;

      setStats(tempStats);
      setStatsEditing(false);
      showToast("Statistik berhasil disimpan", "success");
      await reloadDashboard();
    } catch (error) {
      console.error("Save stats error", error);
      showToast(error.message || "Gagal menyimpan statistik", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <div className="section-wrap mx-auto max-w-md p-6 md:p-8">
        <h3 className="font-[Sora] text-2xl font-semibold text-[var(--brand)]">Login Admin</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">Masuk dengan akun Supabase Auth untuk mengelola konten website.</p>

        <form onSubmit={handleSignIn} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Email</label>
            <input
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--brand)]/20 focus:ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Password</label>
            <input
              type="password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--brand)]/20 focus:ring"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-2)] disabled:opacity-70"
          >
            {busy ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="section-wrap p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <h3 className="font-[Sora] text-xl font-semibold text-[var(--brand)]">Dashboard Admin</h3>
          <p className="text-sm text-[var(--muted)]">Login: {user.email}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Realtime ON</span>
          <button onClick={handleSignOut} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600">
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <article className="rounded-2xl border border-[var(--line)] bg-white p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Berita</p>
          <p className="mt-2 text-3xl font-bold text-[var(--brand)]">{counts.berita}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-white p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Kegiatan</p>
          <p className="mt-2 text-3xl font-bold text-[var(--brand)]">{counts.kegiatan}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-white p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Galeri</p>
          <p className="mt-2 text-3xl font-bold text-[var(--brand)]">{counts.galeri}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-white p-4">
          <button onClick={() => setStatsEditing(!statsEditing)} className="w-full text-left">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Statistik</p>
            <p className="mt-2 text-2xl font-bold text-[var(--accent)]">⚙️ Kelola</p>
          </button>
        </article>
      </div>

      {statsEditing && (
        <section className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-5">
          <h4 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Kelola Statistik</h4>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Jumlah Penduduk</label>
              <input
                type="number"
                value={tempStats.penduduk}
                onChange={(e) => setTempStats({ ...tempStats, penduduk: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--brand)]/20 focus:ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Jumlah Dusun</label>
              <input
                type="number"
                value={tempStats.dusun}
                onChange={(e) => setTempStats({ ...tempStats, dusun: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--brand)]/20 focus:ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Jumlah UMKM</label>
              <input
                type="number"
                value={tempStats.umkm}
                onChange={(e) => setTempStats({ ...tempStats, umkm: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--brand)]/20 focus:ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Jumlah RT/RW</label>
              <input
                type="number"
                value={tempStats.rtrw}
                onChange={(e) => setTempStats({ ...tempStats, rtrw: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--brand)]/20 focus:ring"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSaveStats}
              disabled={busy}
              className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-2)] disabled:opacity-70"
            >
              {busy ? "Menyimpan..." : "Simpan Statistik"}
            </button>
            <button
              onClick={() => setStatsEditing(false)}
              className="rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--brand)]"
            >
              Batal
            </button>
          </div>
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr,1.4fr]">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <h4 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">
            {editingId ? "Edit Konten" : "Tambah Konten"}
          </h4>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {editingId ? "Perbarui data konten yang ada" : "Gambar akan otomatis diupload ke Supabase Storage bucket: " + STORAGE_BUCKET}
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {!editingId && (
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Jenis Konten</label>
                <select
                  value={activeType}
                  onChange={(event) => setActiveType(event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--brand)]/20 focus:ring"
                >
                  {TABLES.map((tableName) => (
                    <option key={tableName} value={tableName}>
                      {CONTENT_CONFIG[tableName].label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Judul</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--brand)]/20 focus:ring"
                placeholder={`Judul ${currentConfig.label.toLowerCase()}`}
              />
            </div>

            {currentConfig.descriptionField && (
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Isi</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--brand)]/20 focus:ring"
                  placeholder="Isi konten singkat"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Gambar (opsional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
              />
            </div>

            {imagePreview && (
              <div>
                <p className="mb-2 text-xs text-[var(--muted)]">Preview Gambar:</p>
                <img src={imagePreview} alt="Preview" className="w-full rounded-xl object-cover" />
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-2)] disabled:opacity-70"
              >
                {busy ? "Menyimpan..." : editingId ? "Perbarui Konten" : `Simpan ${currentConfig.label}`}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--brand)]"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <h4 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Data {currentConfig.label}</h4>
          <p className="mt-1 text-xs text-[var(--muted)]">Perubahan data akan muncul realtime tanpa refresh halaman.</p>

          <div className="mt-4 max-h-[460px] space-y-3 overflow-auto pr-1">
            {activeItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--line)] p-4 text-sm text-[var(--muted)]">Belum ada data.</div>
            )}

            {activeItems.map((item) => {
              const itemTitle = item[currentConfig.titleField] || "Tanpa judul";
              const itemDescription = currentConfig.descriptionField ? item[currentConfig.descriptionField] : "";
              const imageUrl = item[currentConfig.imageField];

              return (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-[var(--line)]">
                  {imageUrl && <img src={imageUrl} alt={itemTitle} className="h-36 w-full object-cover" />}
                  <div className="p-3">
                    <h5 className="font-semibold text-[var(--brand)]">{itemTitle}</h5>
                    {itemDescription && <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{itemDescription}</p>}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-[var(--muted)]">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="text-sm text-blue-600 hover:text-blue-700">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item)} className="text-sm text-red-600 hover:text-red-700">
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
