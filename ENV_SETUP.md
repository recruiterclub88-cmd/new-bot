# ВРЕМЕННОЕ решение для проверки

## Создайте файл `.env.production`

Создайте файл `.env.production` в корне проекта со следующим содержимым:

```env
SUPABASE_URL=https://zrctubjavyhtiumdtau.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_mVTgwJkcX0WrFC9KhqNCcg_WLVf1nVA
WEBHOOK_SECRET=ваш_webhook_secret
GREEN_API_ID_INSTANCE=ваш_green_api_id
GREEN_API_TOKEN=ваш_green_api_token
GEMINI_API_KEY=ваш_gemini_api_key
```

**ВАЖНО:** Этот файл будет игнорироваться Git (он в `.gitignore`), поэтому безопасно.

## Альтернатива: Использовать Vercel CLI

Если у вас установлен Vercel CLI:

```bash
vercel env pull .env.production
```

Это скачает все переменные окружения из Vercel в локальный файл.

## После создания файла

Закоммитьте и запушьте изменения (файл `.env.production` не попадет в Git).

Vercel автоматически использует переменные из своих настроек при билде.
