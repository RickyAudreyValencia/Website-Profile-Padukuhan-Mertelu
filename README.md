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

## File penting

- `src/lib/supabase.js` - wrapper Supabase client
- `src/app/layout.js` - root layout
- `src/app/page.js` - halaman utama (fetch server-side dari Supabase)
- `src/components/*` - komponen UI (Navbar, Hero, Berita, Kegiatan, Galeri, Footer, dll.)


