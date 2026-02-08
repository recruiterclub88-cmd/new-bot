# WA Bot (Green-API + Gemini + Postgres) for Vercel

## What this is
- WhatsApp bot using Green-API webhook
- Gemini generates "human" replies (server-side)
- Postgres stores contacts, memory summary and message history
- Admin panel at `/admin` (Basic Auth)

## 1) Create DB
Use Supabase (Postgres). Run `schema.sql` once in SQL Editor.

## 2) Deploy to Vercel
Import this repo/zip into Vercel.

### Environment Variables (Vercel -> Project -> Settings -> Environment Variables)
Required:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- WEBHOOK_SECRET
- GREEN_API_ID_INSTANCE
- GREEN_API_TOKEN
- GEMINI_API_KEY

Optional:
- GREEN_API_BASE_URL (default: https://api.green-api.com)
- GEMINI_MODEL (default: gemini-1.5-flash)
- ADMIN_USER
- ADMIN_PASS
- SITE_URL
- CANDIDATE_LINK
- AGENCY_LINK

IMPORTANT:
- ADMIN_USER / ADMIN_PASS are REQUIRED to open `/admin` and `/api/admin/*`.
- The bot webhook uses WEBHOOK_SECRET (header `x-webhook-secret` or `?secret=`).

## 3) Configure Green-API webhook
Set webhook URL to:
`https://<your-vercel-domain>/api/wa/webhook?secret=<WEBHOOK_SECRET>`

## 4) Configure bot prompt
Open:
`https://<your-vercel-domain>/admin`
(enter Basic Auth)

Save your SYSTEM PROMPT and links.

## 5) Test
Send a message to your WhatsApp number (the one connected to the Green-API instance).
You should see incoming/outgoing messages in `/admin`.

## Notes
- This MVP includes deduplication via unique provider_message_id.
- Admin panel does not use client-side Supabase keys.
