// Supabase client wrapper
// This file exports a preconfigured Supabase client using the
// `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars.
// The client is safe to use in server components for read-only queries.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Keep this as a runtime check to make debugging easier locally.
  // Do not throw here so that Next.js build doesn't fail in some environments.
  console.warn(
    "Supabase environment variables are not set. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");

// Example helpers (optional): server-side fetch wrappers can be added here
// export async function fetchBerita() { return supabase.from('berita').select('*').order('created_at', { ascending: false }) }