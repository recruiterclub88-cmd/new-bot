import { createClient } from '@supabase/supabase-js';

// Функція для отримання Supabase клієнта з детальним логуванням
export function getSupabaseAdmin() {
  // Детальне логування ВСІХ змінних оточення (без значень для безпеки)
  const allEnvKeys = Object.keys(process.env);
  console.log('[Supabase Init] Total env vars available:', allEnvKeys.length);
  console.log('[Supabase Init] Env keys sample:', allEnvKeys.slice(0, 10));
  console.log('[Supabase Init] Supabase-related keys:',
    allEnvKeys.filter(k => k.includes('SUPABASE') || k.includes('supabase'))
  );

  // Отримуємо змінні з process.env
  // DIAGNOSTIC HARDCODE TEST
  const supabaseUrl = 'https://zrctubjaqyyhtiumdtau.supabase.co';
  const supabaseKey = 'sb_secret_mVTgwJkcXOWrFC9KhqNCcg_WLVf1nVA';

  // Детальне логування для діагностики
  console.log('[Supabase Init] Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlPrefix: supabaseUrl?.substring(0, 20),
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV,
  });

  if (!supabaseUrl || !supabaseKey) {
    const error = `Missing Supabase credentials: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`;
    console.error('❌ [Supabase Init]', error);
    // Не викидаємо помилку, щоб не ламати білд, але логуємо
    // throw new Error(error);
  } else {
    console.log('✅ [Supabase Init] Successfully initialized with URL:', supabaseUrl.substring(0, 30));
  }

  return createClient(supabaseUrl || '', supabaseKey || '', {
    auth: { persistSession: false }
  });
}

// Ліниве ініціалізація - створюємо клієнт тільки при першому використанні
let _supabaseAdmin: any = null;

export const supabaseAdmin: any = new Proxy({}, {
  get(target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = getSupabaseAdmin();
    }
    return (_supabaseAdmin as any)[prop];
  }
});
