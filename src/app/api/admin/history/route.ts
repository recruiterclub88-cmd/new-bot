import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('id, created_at, direction, text, contacts!messages_contact_id_fkey(wa_chat_id, lead_type, stage)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);

    return NextResponse.json({ items: data || [] });
  } catch (e: any) {
    console.error('[History API GET] Error:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
