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
  const [selectedDate, setSelectedDate] = useState("");

  const [lists, setLists] = useState({ berita: [], kegiatan: [], galeri: [] });
  const [counts, setCounts] = useState({ berita: 0, kegiatan: 0, galeri: 0 });
  const [stats, setStats] = useState({ penduduk: 0, dusun: 0, umkm: 0, rtrw: 0 });
  const [statsEditing, setStatsEditing] = useState(false);
  const [tempStats, setTempStats] = useState({ ...stats });
  const [busy, setBusy] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
    setSelectedItem(item);
    setEditingId(item.id);
    setTitle(item[currentConfig.titleField] || "");
    setDescription(currentConfig.descriptionField ? item[currentConfig.descriptionField] || "" : "");
    setFile(null);
    setImagePreview(null);
    // Format tanggal ke format YYYY-MM-DD untuk input date
    if (item.created_at) {
      const date = new Date(item.created_at);
      const formattedDate = date.toISOString().split('T')[0];
      setSelectedDate(formattedDate);
    } else {
      setSelectedDate("");
    }
    setShowEditModal(true);
  }

  async function confirmEditSubmit(event) {
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

      // Include tanggal yang dipilih
      if (selectedDate) {
        // Convert YYYY-MM-DD ke ISO datetime string
        const dateObj = new Date(selectedDate + "T00:00:00");
        payload.created_at = dateObj.toISOString();
      }

      const result = await supabaseBrowser.from(activeType).update(payload).eq("id", editingId);
      if (result.error) throw result.error;

      showToast(`${currentConfig.label} berhasil diperbarui`, "success");
      setShowEditModal(false);
      setEditingId(null);
      setTitle("");
      setDescription("");
      setFile(null);
      setImagePreview(null);
      setSelectedDate("");
      setSelectedItem(null);
      await reloadDashboard();
    } catch (error) {
      console.error("Edit submit error", error);
      showToast(error.message || "Gagal memperbarui data", "error");
    } finally {
      setBusy(false);
    }
  }

  function cancelEditModal() {
    setShowEditModal(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFile(null);
    setImagePreview(null);
    setSelectedDate("");
    setSelectedItem(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFile(null);
    setImagePreview(null);
    setSelectedDate("");
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

      // Include tanggal yang dipilih
      if (selectedDate) {
        // Convert YYYY-MM-DD ke ISO datetime string
        const dateObj = new Date(selectedDate + "T00:00:00");
        payload.created_at = dateObj.toISOString();
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
      setSelectedDate("");
      await reloadDashboard();
    } catch (error) {
      console.error("Submit error", error);
      showToast(error.message || "Gagal menyimpan data", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item) {
    setSelectedItem(item);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!selectedItem) return;

    setBusy(true);

    try {
      const imageUrl = selectedItem[currentConfig.imageField];
      if (imageUrl) {
        await deleteOldImage(imageUrl);
      }

      const { error } = await supabaseBrowser.from(activeType).delete().eq("id", selectedItem.id);
      if (error) throw error;

      showToast(`${currentConfig.label} berhasil dihapus`, "success");
      setShowDeleteModal(false);
      setSelectedItem(null);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--line)] bg-gradient-to-r from-[var(--surface-soft)] to-white p-6 md:p-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="font-[Sora] text-2xl font-bold text-[var(--brand)]">Dashboard Admin</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">Admin: <span className="font-semibold">{user.email}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-emerald-700">Realtime ON</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="stat-card rounded-2xl border border-[var(--line)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Berita</p>
              <p className="mt-3 text-4xl font-bold text-[var(--brand)]">{counts.berita}</p>
            </div>
            <span className="text-3xl">📰</span>
          </div>
        </article>

        <article className="stat-card rounded-2xl border border-[var(--line)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Kegiatan</p>
              <p className="mt-3 text-4xl font-bold text-[var(--brand)]">{counts.kegiatan}</p>
            </div>
            <span className="text-3xl">🎯</span>
          </div>
        </article>

        <article className="stat-card rounded-2xl border border-[var(--line)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Galeri</p>
              <p className="mt-3 text-4xl font-bold text-[var(--brand)]">{counts.galeri}</p>
            </div>
            <span className="text-3xl">🖼️</span>
          </div>
        </article>

        <button
          onClick={() => setStatsEditing(!statsEditing)}
          className="stat-card group rounded-2xl border border-[var(--line)] p-5 text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Statistik</p>
              <p className="mt-3 text-sm font-bold text-[var(--accent)] group-hover:text-[var(--brand)]">Kelola Data</p>
            </div>
            <span className="text-3xl">⚙️</span>
          </div>
        </button>
      </div>

      {/* Statistik Editor */}
      {statsEditing && (
        <section className="fade-up rounded-2xl border border-[var(--line)] bg-gradient-to-r from-amber-50 to-white p-6 md:p-8">
          <h4 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Kelola Statistik Padukuhan</h4>
          <p className="mt-1 text-sm text-[var(--muted)]">Update data statistik yang ditampilkan di halaman utama</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">📊 Jumlah Penduduk</label>
              <input
                type="number"
                value={tempStats.penduduk}
                onChange={(e) => setTempStats({ ...tempStats, penduduk: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none ring-[var(--brand)]/20 focus:ring"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">🏘️ Jumlah Dusun</label>
              <input
                type="number"
                value={tempStats.dusun}
                onChange={(e) => setTempStats({ ...tempStats, dusun: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none ring-[var(--brand)]/20 focus:ring"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">🏪 Jumlah UMKM</label>
              <input
                type="number"
                value={tempStats.umkm}
                onChange={(e) => setTempStats({ ...tempStats, umkm: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none ring-[var(--brand)]/20 focus:ring"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">🏛️ Jumlah RT/RW</label>
              <input
                type="number"
                value={tempStats.rtrw}
                onChange={(e) => setTempStats({ ...tempStats, rtrw: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none ring-[var(--brand)]/20 focus:ring"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleSaveStats}
              disabled={busy}
              className="rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-2)] disabled:opacity-70 transition-all"
            >
              {busy ? "Menyimpan..." : "💾 Simpan Statistik"}
            </button>
            <button
              onClick={() => setStatsEditing(false)}
              className="rounded-xl border border-[var(--line)] px-6 py-3 text-sm font-semibold text-[var(--brand)] hover:bg-[var(--surface-soft)] transition-all"
            >
              Batal
            </button>
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Form Section */}
        <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
          <h4 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">
            {editingId ? "✏️ Edit Konten" : "➕ Tambah Konten"}
          </h4>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {editingId ? "Perbarui data konten yang sudah ada" : "Buat konten baru untuk website"}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {!editingId && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">Jenis Konten</label>
                <select
                  value={activeType}
                  onChange={(event) => setActiveType(event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--brand)]/20 focus:ring text-sm"
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
              <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">Judul *</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/20 focus:ring"
                placeholder={`Judul ${currentConfig.label.toLowerCase()}`}
              />
            </div>

            {currentConfig.descriptionField && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/20 focus:ring"
                  placeholder="Isi konten singkat"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">Gambar (Opsional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm rounded-xl border border-[var(--line)] bg-white px-3 py-2.5"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">PNG, JPG, WebP (max 5MB)</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">📅 Pilih Tanggal</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/20 focus:ring"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">Kosongkan untuk gunakan tanggal saat ini</p>
            </div>

            {imagePreview && (
              <div className="rounded-xl border border-[var(--line)] overflow-hidden">
                <p className="bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">Preview Gambar</p>
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover" />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-2)] disabled:opacity-70 transition-all"
              >
                {busy ? "Menyimpan..." : editingId ? "Update" : "Simpan"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-soft)] transition-all"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Data List Section */}
        <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Data {currentConfig.label}</h4>
              <p className="mt-1 text-xs text-[var(--muted)]">{activeItems.length} item • Update realtime</p>
            </div>
          </div>

          <div className="mt-5 max-h-[540px] space-y-3 overflow-auto pr-2">
            {activeItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-6 text-center text-sm text-[var(--muted)]">
                <p className="text-lg mb-1">📭</p>
                <p className="font-medium">Belum ada data {currentConfig.label.toLowerCase()}</p>
                <p className="text-xs mt-1">Tambahkan konten baru di form sebelah</p>
              </div>
            )}

            {activeItems.map((item) => {
              const itemTitle = item[currentConfig.titleField] || "Tanpa judul";
              const itemDescription = currentConfig.descriptionField ? item[currentConfig.descriptionField] : "";
              const imageUrl = item[currentConfig.imageField];

              return (
                <article key={item.id} className="card-hover-glow overflow-hidden rounded-2xl border border-[var(--line)] bg-white transition-all">
                  {imageUrl && (
                    <div className="h-24 overflow-hidden bg-[var(--surface-soft)]">
                      <img src={imageUrl} alt={itemTitle} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h5 className="font-semibold text-[var(--brand)] line-clamp-2">{itemTitle}</h5>
                    {itemDescription && (
                      <p className="mt-2 line-clamp-2 text-xs text-[var(--muted)]">{itemDescription}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-[var(--muted)]">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-all"
                        >
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

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-[var(--line)] shadow-xl">
            <div className="sticky top-0 bg-gradient-to-r from-[var(--brand)]/10 to-[var(--accent)]/10 px-6 py-4 border-b border-[var(--line)]">
              <h3 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">✏️ Edit {currentConfig.label}</h3>
              <p className="text-sm text-[var(--muted)] mt-1">Perbarui data di form ini</p>
            </div>

            <form onSubmit={confirmEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">Judul *</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/20 focus:ring"
                  placeholder={`Judul ${currentConfig.label.toLowerCase()}`}
                />
              </div>

              {currentConfig.descriptionField && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">Deskripsi</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/20 focus:ring"
                    placeholder="Isi konten singkat"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">Gambar (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm rounded-xl border border-[var(--line)] bg-white px-3 py-2.5"
                />
                <p className="mt-1 text-xs text-[var(--muted)]">PNG, JPG, WebP (max 5MB)</p>
              </div>

              {(imagePreview || selectedItem[currentConfig.imageField]) && (
                <div className="rounded-xl border border-[var(--line)] overflow-hidden">
                  <p className="bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">Preview Gambar</p>
                  <img src={imagePreview || selectedItem[currentConfig.imageField]} alt="Preview" className="w-full h-32 object-cover" />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--brand)]">📅 Pilih Tanggal</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/20 focus:ring"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cancelEditModal}
                  disabled={busy}
                  className="flex-1 rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--brand)] hover:bg-[var(--surface-soft)] transition-all disabled:opacity-70"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-all disabled:opacity-70"
                >
                  {busy ? "Menyimpan..." : "💾 Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full bg-white rounded-2xl border border-[var(--line)] shadow-xl overflow-hidden animate-in">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-[var(--line)]">
              <h3 className="font-[Sora] text-lg font-semibold text-red-600">🗑️ Hapus Konten</h3>
              <p className="text-sm text-red-600/70 mt-1">Tindakan ini tidak dapat dibatalkan</p>
            </div>

            <div className="p-6">
              <div className="mb-4 rounded-xl overflow-hidden bg-[var(--surface-soft)]">
                {selectedItem[currentConfig.imageField] && (
                  <img 
                    src={selectedItem[currentConfig.imageField]} 
                    alt={selectedItem[currentConfig.titleField]} 
                    className="w-full h-32 object-cover opacity-75"
                  />
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)] font-semibold mb-1">Judul</p>
                  <p className="text-sm font-semibold text-[var(--brand)]">{selectedItem[currentConfig.titleField]}</p>
                </div>

                {currentConfig.descriptionField && selectedItem[currentConfig.descriptionField] && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)] font-semibold mb-1">Deskripsi</p>
                    <p className="text-sm text-[var(--muted)] line-clamp-2">{selectedItem[currentConfig.descriptionField]}</p>
                  </div>
                )}
              </div>

              <p className="text-sm text-red-600 mt-4 font-semibold">
                ⚠️ Yakin ingin menghapus "{selectedItem[currentConfig.titleField]}"?
              </p>
            </div>

            <div className="bg-[var(--surface-soft)] px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                }}
                disabled={busy}
                className="flex-1 rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--brand)] hover:bg-white transition-all disabled:opacity-70"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={busy}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-all disabled:opacity-70"
              >
                {busy ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
