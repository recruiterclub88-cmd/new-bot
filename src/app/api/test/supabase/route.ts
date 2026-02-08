import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Тестуємо прямий доступ до Supabase
    const testUrl = 'https://zrctubjavyhtiumdtau.supabase.co';
    const testKey = 'sb_secret_mVTgwJkcX0WrFC9KhqNCcg_WLVf1nVA';

    try {
        // Тест 1: Простий fetch до Supabase REST API
        const response = await fetch(`${testUrl}/rest/v1/settings?select=key,value`, {
            headers: {
                'apikey': testKey,
                'Authorization': `Bearer ${testKey}`,
            },
        });

        const data = await response.json();

        return NextResponse.json({
            test: 'direct_fetch',
            status: response.status,
            ok: response.ok,
            data: data,
            headers: Object.fromEntries(response.headers.entries()),
        });
    } catch (e: any) {
        return NextResponse.json({
            test: 'direct_fetch',
            error: e.message,
            stack: e.stack,
            cause: e.cause,
        }, { status: 500 });
    }
}
