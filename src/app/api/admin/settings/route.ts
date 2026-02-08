import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Логуємо всі доступні env змінні (без значень для безпеки)
    console.log('[Settings API] Available env vars:', {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
    });

    console.log('[Settings API] Attempting to fetch from Supabase...');

    // Використовуємо supabaseAdmin напрямую - він викличе getSupabaseAdmin() автоматично
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('key,value')
      .in('key', ['system_prompt', 'site_url', 'candidate_link', 'agency_link', 'tone']);

    console.log('[Settings API] Supabase response:', {
      hasData: !!data,
      dataLength: data?.length,
      hasError: !!error,
      errorMessage: error?.message,
      errorDetails: error?.details,
      errorHint: error?.hint,
    });

    if (error) {
      console.error('[Settings API] Supabase error details:', JSON.stringify(error, null, 2));
      throw new Error(`Supabase error: ${error.message || JSON.stringify(error)}`);
    }

    const map: Record<string, string> = {};
    for (const row of data || []) map[row.key] = row.value;

    console.log('[Settings API] Successfully fetched settings, keys:', Object.keys(map));

    return NextResponse.json({
      system_prompt: map.system_prompt || '',
      site_url: map.site_url || '',
      candidate_link: map.candidate_link || '',
      agency_link: map.agency_link || '',
      tone: map.tone || '',
    });
  } catch (e: any) {
    console.error('[Settings API GET] Error:', e);
    console.error('[Settings API GET] Error stack:', e?.stack);
    console.error('[Settings API GET] Error cause:', e?.cause);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const upserts = [
      ['system_prompt', String(body.system_prompt || '')],
      ['site_url', String(body.site_url || '')],
      ['candidate_link', String(body.candidate_link || '')],
      ['agency_link', String(body.agency_link || '')],
      ['tone', String(body.tone || '')],
    ].map(([key, value]) => ({ key, value }));

    const { error } = await supabaseAdmin.from('settings').upsert(upserts, { onConflict: 'key' });
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[Settings API POST] Error:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
