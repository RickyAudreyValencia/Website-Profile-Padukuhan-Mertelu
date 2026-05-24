"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Save,
  Settings2,
  Trash2,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
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
    icon: FileText,
  },
  kegiatan: {
    label: "Kegiatan",
    titleField: "judul",
    descriptionField: "deskripsi",
    imageField: "gambar",
    icon: CalendarDays,
  },
  galeri: {
    label: "Galeri",
    titleField: "judul",
    descriptionField: null,
    imageField: "gambar",
    icon: ImageIcon,
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

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminIconButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-[var(--muted)] transition hover:border-[var(--brand)]/30 hover:bg-[var(--surface-soft)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
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
  const CurrentIcon = currentConfig.icon;

  const activeItems = useMemo(() => lists[activeType] || [], [activeType, lists]);

  const statCards = [
    { label: "Berita", value: counts.berita, icon: FileText },
    { label: "Kegiatan", value: counts.kegiatan, icon: CalendarDays },
    { label: "Galeri", value: counts.galeri, icon: ImageIcon },
  ];

  const villageStats = [
    { key: "penduduk", label: "Jumlah Penduduk", icon: Users },
    { key: "dusun", label: "Jumlah Dusun", icon: BarChart3 },
    { key: "umkm", label: "Jumlah UMKM", icon: Activity },
    { key: "rtrw", label: "Jumlah RT/RW", icon: Settings2 },
  ];

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

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFile(null);
    setImagePreview(null);
    setSelectedDate("");
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

    if (item.created_at) {
      setSelectedDate(new Date(item.created_at).toISOString().split("T")[0]);
    } else {
      setSelectedDate("");
    }

    setShowEditModal(true);
  }

  function getPayload(imageUrl) {
    const payload = {
      [currentConfig.titleField]: title.trim(),
    };

    if (currentConfig.descriptionField) {
      payload[currentConfig.descriptionField] = description.trim();
    }

    if (imageUrl) {
      payload[currentConfig.imageField] = imageUrl;
    }

    if (selectedDate) {
      payload.created_at = new Date(`${selectedDate}T00:00:00`).toISOString();
    }

    return payload;
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
        if (editingItem?.[currentConfig.imageField]) {
          await deleteOldImage(editingItem[currentConfig.imageField]);
        }
      }

      const result = await supabaseBrowser.from(activeType).update(getPayload(imageUrl)).eq("id", editingId);
      if (result.error) throw result.error;

      showToast(`${currentConfig.label} berhasil diperbarui`, "success");
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
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
    setSelectedItem(null);
    resetForm();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) {
      showToast("Judul wajib diisi", "error");
      return;
    }

    setBusy(true);

    try {
      const imageUrl = await uploadImageIfAny();
      const result = await supabaseBrowser.from(activeType).insert([getPayload(imageUrl)]);
      if (result.error) throw result.error;

      showToast(`${currentConfig.label} berhasil ditambahkan`, "success");
      resetForm();
      await reloadDashboard();
    } catch (error) {
      console.error("Submit error", error);
      showToast(error.message || "Gagal menyimpan data", "error");
    } finally {
      setBusy(false);
    }
  }

  function handleDelete(item) {
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

      const response = await fetch("/api/delete-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table: activeType,
          id: selectedItem.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.includes("Service role key not configured")) {
          showToast("Service role key belum dikonfigurasi. Tambahkan SUPABASE_SERVICE_ROLE ke .env.local atau perbaiki RLS Policy.", "error");
        } else {
          showToast(result.error || "Gagal menghapus data", "error");
        }
        setBusy(false);
        return;
      }

      showToast(`${currentConfig.label} berhasil dihapus`, "success");
      setShowDeleteModal(false);
      setSelectedItem(null);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await reloadDashboard();
    } catch (error) {
      console.error("[DELETE] Error caught:", error);
      showToast(error instanceof Error ? error.message : "Gagal menghapus data", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveStats() {
    setBusy(true);
    try {
      const existing = await supabaseBrowser.from("statistik").select("id").single();
      const dbPayload = {
        jumlah_penduduk: tempStats.penduduk,
        jumlah_dusun: tempStats.dusun,
        jumlah_umkm: tempStats.umkm,
        jumlah_rt_rw: tempStats.rtrw,
      };

      const result = existing.data
        ? await supabaseBrowser.from("statistik").update(dbPayload).eq("id", existing.data.id)
        : await supabaseBrowser.from("statistik").insert([dbPayload]);

      if (result.error) throw result.error;

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
      <div className="mx-auto max-w-md rounded-lg border border-[var(--line)] bg-white p-6 shadow-[0_18px_45px_rgba(31,43,36,0.08)] md:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--brand)]">
            <Users size={21} />
          </div>
          <div>
            <h3 className="font-[Sora] text-xl font-semibold text-[var(--brand)]">Masuk Admin</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Gunakan akun pengelola untuk memperbarui konten website padukuhan.</p>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Email</label>
            <input
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/15 transition focus:border-[var(--brand)] focus:ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Password</label>
            <input
              type="password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/15 transition focus:border-[var(--brand)] focus:ring"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-2)] disabled:opacity-70"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-[0_16px_40px_rgba(31,43,36,0.07)] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Ruang pengelola</p>
            <h3 className="mt-2 font-[Sora] text-2xl font-semibold text-[var(--brand)]">Data Website Padukuhan</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Masuk sebagai <span className="font-semibold text-[var(--foreground)]">{user.email}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={15} />
              Realtime aktif
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--brand)]"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-lg border border-[var(--line)] bg-white p-4 shadow-[0_10px_26px_rgba(31,43,36,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[var(--muted)]">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--brand)]">{card.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--brand)]">
                  <Icon size={20} />
                </div>
              </div>
            </article>
          );
        })}

        <button
          onClick={() => setStatsEditing(!statsEditing)}
          className="rounded-lg border border-[var(--line)] bg-white p-4 text-left shadow-[0_10px_26px_rgba(31,43,36,0.05)] transition hover:border-[var(--brand)]/30 hover:bg-[var(--surface-soft)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--muted)]">Statistik</p>
              <p className="mt-2 text-sm font-semibold text-[var(--brand)]">{statsEditing ? "Tutup pengaturan" : "Kelola angka utama"}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--brand)]">
              <Settings2 size={20} />
            </div>
          </div>
        </button>
      </div>

      {statsEditing && (
        <section className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-[0_16px_40px_rgba(31,43,36,0.06)] md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Statistik Padukuhan</h4>
              <p className="mt-1 text-sm text-[var(--muted)]">Angka ini ditampilkan pada halaman utama.</p>
            </div>
            <button
              onClick={() => setStatsEditing(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)]"
            >
              <X size={16} />
              Tutup
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {villageStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key}>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                    <Icon size={16} className="text-[var(--brand)]" />
                    {item.label}
                  </label>
                  <input
                    type="number"
                    value={tempStats[item.key]}
                    onChange={(e) => setTempStats({ ...tempStats, [item.key]: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/15 transition focus:border-[var(--brand)] focus:ring"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleSaveStats}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-2)] disabled:opacity-70"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {busy ? "Menyimpan..." : "Simpan Statistik"}
            </button>
            <button
              onClick={() => setTempStats(stats)}
              className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)]"
            >
              Kembalikan
            </button>
          </div>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-[0_16px_40px_rgba(31,43,36,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Tambah Konten</h4>
              <p className="mt-1 text-sm text-[var(--muted)]">Isi data seperlunya, lalu simpan ke website.</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--brand)]">
              <Plus size={20} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Jenis Konten</label>
              <div className="grid grid-cols-3 gap-2">
                {TABLES.map((tableName) => {
                  const Icon = CONTENT_CONFIG[tableName].icon;
                  const isActive = activeType === tableName;
                  return (
                    <button
                      type="button"
                      key={tableName}
                      onClick={() => {
                        setActiveType(tableName);
                        resetForm();
                      }}
                      className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border px-2 py-3 text-xs font-semibold transition ${
                        isActive
                          ? "border-[var(--brand)] bg-[var(--surface-soft)] text-[var(--brand)]"
                          : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--brand)]/30 hover:text-[var(--brand)]"
                      }`}
                    >
                      <Icon size={18} />
                      {CONTENT_CONFIG[tableName].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Judul *</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/15 transition focus:border-[var(--brand)] focus:ring"
                placeholder={`Judul ${currentConfig.label.toLowerCase()}`}
              />
            </div>

            {currentConfig.descriptionField && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/15 transition focus:border-[var(--brand)] focus:ring"
                  placeholder="Tulis isi singkat untuk ditampilkan"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Gambar</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-soft)] px-4 py-5 text-center transition hover:border-[var(--brand)]/40">
                <UploadCloud size={24} className="text-[var(--brand)]" />
                <span className="mt-2 text-sm font-semibold text-[var(--foreground)]">Pilih gambar</span>
                <span className="mt-1 text-xs text-[var(--muted)]">PNG, JPG, atau WebP</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </label>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                <CalendarDays size={16} className="text-[var(--brand)]" />
                Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/15 transition focus:border-[var(--brand)] focus:ring"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">Kosongkan untuk memakai tanggal saat ini.</p>
            </div>

            {imagePreview && (
              <div className="overflow-hidden rounded-lg border border-[var(--line)]">
                <img src={imagePreview} alt="Preview" className="h-36 w-full object-cover" />
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-2)] disabled:opacity-70"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {busy ? "Menyimpan..." : "Simpan Konten"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-[var(--line)] bg-white shadow-[0_16px_40px_rgba(31,43,36,0.06)]">
          <div className="border-b border-[var(--line)] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--brand)]">
                  <CurrentIcon size={20} />
                </div>
                <div>
                  <h4 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Data {currentConfig.label}</h4>
                  <p className="mt-1 text-sm text-[var(--muted)]">{activeItems.length} item tersimpan</p>
                </div>
              </div>
              <div className="flex rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-1">
                {TABLES.map((tableName) => (
                  <button
                    key={tableName}
                    onClick={() => {
                      setActiveType(tableName);
                      resetForm();
                    }}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                      activeType === tableName ? "bg-white text-[var(--brand)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--brand)]"
                    }`}
                  >
                    {CONTENT_CONFIG[tableName].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-h-[620px] overflow-auto p-5">
            {activeItems.length === 0 && (
              <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-8 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[var(--brand)]">
                  <CurrentIcon size={21} />
                </div>
                <p className="mt-3 font-semibold text-[var(--foreground)]">Belum ada data {currentConfig.label.toLowerCase()}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Tambahkan konten pertama dari form di sebelah kiri.</p>
              </div>
            )}

            <div className="space-y-3">
              {activeItems.map((item) => {
                const itemTitle = item[currentConfig.titleField] || "Tanpa judul";
                const itemDescription = currentConfig.descriptionField ? item[currentConfig.descriptionField] : "";
                const imageUrl = item[currentConfig.imageField];

                return (
                  <article key={item.id} className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-3 transition hover:border-[var(--brand)]/30 hover:bg-[var(--surface-soft)] md:grid-cols-[132px_1fr]">
                    <div className="h-28 overflow-hidden rounded-md bg-[var(--surface-soft)]">
                      {imageUrl ? (
                        <img src={imageUrl} alt={itemTitle} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex gap-3">
                        <div className="min-w-0 flex-1">
                          <h5 className="line-clamp-2 font-semibold text-[var(--foreground)]">{itemTitle}</h5>
                          {itemDescription && <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{itemDescription}</p>}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <AdminIconButton onClick={() => handleEdit(item)} aria-label={`Edit ${itemTitle}`}>
                            <Pencil size={16} />
                          </AdminIconButton>
                          <AdminIconButton onClick={() => handleDelete(item)} aria-label={`Hapus ${itemTitle}`} className="hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={16} />
                          </AdminIconButton>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
                        <CalendarDays size={14} />
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-[var(--line)] bg-white shadow-xl">
            <div className="sticky top-0 border-b border-[var(--line)] bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-[Sora] text-lg font-semibold text-[var(--brand)]">Edit {currentConfig.label}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">Perbarui data lalu simpan perubahan.</p>
                </div>
                <AdminIconButton type="button" onClick={cancelEditModal} aria-label="Tutup modal edit">
                  <X size={16} />
                </AdminIconButton>
              </div>
            </div>

            <form onSubmit={confirmEditSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Judul *</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/15 transition focus:border-[var(--brand)] focus:ring"
                  placeholder={`Judul ${currentConfig.label.toLowerCase()}`}
                />
              </div>

              {currentConfig.descriptionField && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Deskripsi</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/15 transition focus:border-[var(--brand)] focus:ring"
                    placeholder="Tulis isi singkat untuk ditampilkan"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Gambar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
                />
              </div>

              {(imagePreview || selectedItem[currentConfig.imageField]) && (
                <div className="overflow-hidden rounded-lg border border-[var(--line)]">
                  <img src={imagePreview || selectedItem[currentConfig.imageField]} alt="Preview" className="h-40 w-full object-cover" />
                </div>
              )}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                  <CalendarDays size={16} className="text-[var(--brand)]" />
                  Tanggal
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/15 transition focus:border-[var(--brand)] focus:ring"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={cancelEditModal}
                  disabled={busy}
                  className="flex-1 rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)] disabled:opacity-70"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-2)] disabled:opacity-70"
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {busy ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-xl">
            <div className="border-b border-red-100 bg-red-50 px-5 py-4">
              <h3 className="font-[Sora] text-lg font-semibold text-red-700">Hapus Konten</h3>
              <p className="mt-1 text-sm text-red-700/75">Data yang dihapus tidak bisa dikembalikan dari panel ini.</p>
            </div>

            <div className="p-5">
              {selectedItem[currentConfig.imageField] && (
                <div className="mb-4 overflow-hidden rounded-lg bg-[var(--surface-soft)]">
                  <img
                    src={selectedItem[currentConfig.imageField]}
                    alt={selectedItem[currentConfig.titleField]}
                    className="h-32 w-full object-cover opacity-80"
                  />
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Judul</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{selectedItem[currentConfig.titleField]}</p>

              {currentConfig.descriptionField && selectedItem[currentConfig.descriptionField] && (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Deskripsi</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{selectedItem[currentConfig.descriptionField]}</p>
                </>
              )}

              <p className="mt-5 text-sm font-semibold text-red-700">Yakin ingin menghapus konten ini?</p>
            </div>

            <div className="flex gap-3 border-t border-[var(--line)] bg-[var(--surface-soft)] px-5 py-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                }}
                disabled={busy}
                className="flex-1 rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--brand)] disabled:opacity-70"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {busy ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
