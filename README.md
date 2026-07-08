# Website Desa (Next.js + Tailwind + Supabase)

Proyek ini adalah template website profil desa modern menggunakan Next.js App Router, Tailwind CSS, dan Supabase sebagai backend.

## Quick start

1. Install dependencies

```bash
npm install
```

2. Tambahkan environment variables

- Salin `.env.local.example` menjadi `.env.local`
- Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari dashboard Supabase (Project -> Settings -> API)
 - Jika Anda ingin menggunakan fitur admin (menghapus/ubah data) dari panel admin, tambahkan juga `SUPABASE_SERVICE_ROLE` ke `.env.local`.
	 Dapatkan nilai `service_role` dari Supabase Dashboard -> Settings -> API -> Service key. Simpan rahasia ini secara privat dan jangan commit ke git.

3. Jalankan dev server

```bash
npm run dev
```

4. Buka `http://localhost:3000`

## Supabase setup

Pastikan Anda sudah membuat project di Supabase dan membuat 3 tabel berikut di schema `public`:

- `berita` (columns: `id` serial PK, `title` text, `content` text, `image` text, `created_at` timestamp)
- `kegiatan` (columns: `id`, `judul`, `deskripsi`, `gambar`, `created_at`)
- `galeri` (columns: `id`, `judul`, `gambar`, `created_at`)

Contoh SQL (sesuaikan tipe dan pengaturan):

```sql
create table berita (
	id bigserial primary key,
	title text,
	content text,
	image text,
	created_at timestamp with time zone default now()
);

create table kegiatan (
	id bigserial primary key,
	judul text,
	deskripsi text,
	gambar text,
	created_at timestamp with time zone default now()
);

create table galeri (
	id bigserial primary key,
	judul text,
	gambar text,
	created_at timestamp with time zone default now()
);
```

## Menambahkan data awal

Anda bisa menambahkan data lewat Supabase UI (Table Editor) atau impor CSV.

Jika tabel kosong, UI akan menampilkan contoh gambar Unsplash.

## Admin / Login

- Untuk fitur admin (ubah data dari situs), gunakan Supabase Auth + RLS. Saat ini proyek ini hanya menampilkan data read-only dari Supabase.
- Anda dapat menggunakan Supabase Dashboard -> Authentication untuk mengaktifkan sign-up dan menambahkan user admin.
- Jangan simpan `service_role` key di repository publik.

### Deployment (Vercel)

- Jika Anda deploy ke Vercel dan ingin fitur hapus/ubah dari admin panel bekerja menggunakan server-side privileged key, tambahkan `SUPABASE_SERVICE_ROLE` ke **Project Settings → Environment Variables** pada Vercel (set untuk `Production`/`Preview` sesuai kebutuhan) dan redeploy. Gunakan nama variabel `SUPABASE_SERVICE_ROLE` (tanpa `NEXT_PUBLIC_`).
- Alternatif yang lebih aman: konfigurasi RLS di Supabase agar hanya user tertentu (mis. role `admin` atau via custom claim) dapat menghapus baris. Dengan pendekatan ini Anda tidak perlu menyimpan service role di Vercel — aplikasi akan mengirim token user saat memanggil API dan server akan mencoba melakukan delete memakai token user (jika service role tidak tersedia).

Contoh flow untuk Vercel:

1. Di Vercel Dashboard → Project → Settings → Environment Variables, tambahkan:
	- `NEXT_PUBLIC_SUPABASE_URL` = your project URL
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
	- `SUPABASE_SERVICE_ROLE` = service role key (ONLY if you want server to bypass RLS)
2. Redeploy project (trigger a new deployment).
3. Setelah deployment selesai, buka halaman admin dan coba fitur hapus.

Catatan: Service role key sangat sensitif — jangan publikasikan. Jika memungkinkan, gunakan RLS-based approach untuk membatasi operasi sensitif hanya untuk admin.

## File penting

- `src/lib/supabase.js` - wrapper Supabase client
- `src/app/layout.js` - root layout
- `src/app/page.js` - halaman utama (fetch server-side dari Supabase)
- `src/components/*` - komponen UI (Navbar, Hero, Berita, Kegiatan, Galeri, Footer, dll.)


