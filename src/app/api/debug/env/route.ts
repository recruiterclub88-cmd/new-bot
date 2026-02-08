import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const envCheck = {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL,
        vercelEnv: process.env.VERCEL_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrlPrefix: process.env.SUPABASE_URL?.substring(0, 30) || 'NOT_SET',
        allEnvKeysCount: Object.keys(process.env).length,
        supabaseRelatedKeys: Object.keys(process.env).filter(k =>
            k.toLowerCase().includes('supabase')
        ),
    };

    return NextResponse.json(envCheck);
}
