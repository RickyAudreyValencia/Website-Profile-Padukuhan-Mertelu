import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { table, id } = await request.json();

    if (!table || !id) {
      return NextResponse.json({ error: 'Missing table or id' }, { status: 400 });
    }

    // Use service role key for backend delete (bypass RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { 
          error: 'Service role key not configured',
          message: 'Tambahkan SUPABASE_SERVICE_ROLE ke .env.local untuk enable delete'
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl || '', serviceRoleKey);

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
