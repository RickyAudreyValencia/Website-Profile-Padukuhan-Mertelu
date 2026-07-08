import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { table, id } = await request.json();

    if (!table || !id) {
      return NextResponse.json({ error: 'Missing table or id' }, { status: 400 });
    }

    // Prefer service role key for backend delete (bypass RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Allow two modes:
    // 1) If SUPABASE_SERVICE_ROLE is set, use it (server-side privileged).
    // 2) Otherwise, if client provided an Authorization bearer token, use the anon key
    //    and set the user's auth token on the server client so RLS policies apply.
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

    let supabase;
    if (serviceRoleKey) {
      supabase = createClient(supabaseUrl || '', serviceRoleKey);
    } else if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (!supabaseAnonKey) {
        return NextResponse.json(
          { error: 'Supabase anon key not configured' },
          { status: 500 }
        );
      }
      supabase = createClient(supabaseUrl || '', supabaseAnonKey);
      if (token) {
        // set the user's token on the server client so requests run as that user
        // (do not log the token)
        // cast to any to avoid TypeScript type mismatch for setAuth
        (supabase.auth as any).setAuth(token);
      }
    } else {
      return NextResponse.json(
        { 
          error: 'Service role key not configured',
          message: 'Tambahkan SUPABASE_SERVICE_ROLE ke .env.local untuk enable delete atau pastikan user sudah login dan RLS mengizinkan penghapusan.'
        },
        { status: 500 }
      );
    }

    // Delete dari database
    const { error, data } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('[API DELETE ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('[API DELETE SUCCESS]', { table, id, deletedRows: data?.length });

    return NextResponse.json({ 
      success: true, 
      message: `${data?.length || 0} baris dihapus`,
      data 
    });
  } catch (error) {
    console.error('[API DELETE EXCEPTION]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
