# Setup Guide: Fix Galeri Delete RLS Policy Issue

## Masalah
Tombol delete di galeri tidak bekerja karena **RLS (Row-Level Security) Policy** di Supabase menghalangi delete operation.

## Solusi (2 Pilihan)

### ✅ PILIHAN 1: Gunakan Service Role Key (RECOMMENDED)

Service Role Key memiliki full access ke database dan bypass RLS policy.

**Langkah:**

1. Buka **Supabase Dashboard** → Login ke project Anda
   - URL: https://app.supabase.com/

2. Klik **Settings** (⚙️) di sidebar kiri

3. Pilih **API** di menu

4. Di bagian **Project API keys**, cari **Service Role key** (bukan Anon key)
   - Anon key: Dimulai dengan `eyJhbGc...`
   - Service Role key: Lebih panjang, jangan bagikan!

5. **Copy Service Role key** tersebut

6. Buka file `.env.local` di root project (buat jika belum ada):
   ```bash
   # Copy dari .env.local.example atau buat file baru
   NEXT_PUBLIC_SUPABASE_URL=https://wazgngraowkufklzggfn.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_yfZjc9-_QUNO9b9JyGV-mQ_Hqmi27XM
   SUPABASE_SERVICE_ROLE=YOUR_SERVICE_ROLE_KEY_HERE
   ```

7. **Ganti `YOUR_SERVICE_ROLE_KEY_HERE`** dengan service role key yang sudah di-copy

8. **Restart dev server** (Ctrl+C, lalu `npm run dev`)

9. Test delete sekarang - seharusnya berhasil ✅

---

### ⚠️ PILIHAN 2: Fix RLS Policy di Supabase

Jika tidak ingin menggunakan Service Role Key, bisa disable RLS di table galeri:

1. Buka **Supabase Dashboard** → Settings → **Authentication** → **Policies**

2. Pilih table `galeri`

3. Cari RLS policy yang menghalangi DELETE

4. **Edit atau Delete policy** tersebut

5. Atau buat policy baru:
   ```sql
   CREATE POLICY "Enable delete for authenticated users" ON public.galeri
   FOR DELETE
   USING (auth.role() = 'authenticated');
   ```

---

## Verifikasi

Setelah setup, test dengan:

1. Refresh browser (Ctrl+F5)
2. Login ke admin
3. Klik button "Hapus" pada galeri
4. Buka **Console** (F12) dan lihat log `[DELETE]`
5. Data seharusnya hilang ✅

## Keamanan
- ⚠️ **Jangan** commit `.env.local` ke Git
- ⚠️ **Jangan** bagikan Service Role Key ke public
- ✅ Service Role Key hanya digunakan di **backend** (Next.js API route)
