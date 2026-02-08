import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envVars = Object.keys(process.env).map(key => ({
    key: key,
    length: key.length,
    codes: key.split('').map(c => c.charCodeAt(0)),
    valueExists: !!process.env[key],
    valueLength: process.env[key]?.length || 0,
    // Show first 5 chars of value for verification (safe for debug)
    preview: process.env[key] ? process.env[key]?.substring(0, 5) + '...' : 'undefined'
  }));

  const supabaseVars = envVars.filter(v => v.key.toLowerCase().includes('supabase'));

  return NextResponse.json({
    message: 'Environment Debug',
    supabaseCheck: supabaseVars,
    allKeys: envVars.map(v => v.key).sort()
  });
}
