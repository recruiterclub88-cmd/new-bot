-- Recruiter Club WA Bot DB schema (Postgres / Supabase)
-- Run this once in Supabase SQL editor.

create table if not exists public.settings (
  key text primary key,
  value text not null default ''
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  wa_chat_id text not null unique,
  lead_type text not null default 'unknown',
  stage text not null default 'start',
  summary text not null default '',
  opt_out boolean not null default false,
  last_link_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  direction text not null check (direction in ('in','out')),
  provider_message_id text not null unique,
  text text not null default '',
  created_at timestamptz not null default now()
);

-- Optional: followups queue (not yet used in this MVP routes)
create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  type text not null,
  run_at timestamptz not null,
  status text not null default 'pending',
  attempt int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed minimal settings keys (safe to re-run)
insert into public.settings(key,value) values
('system_prompt',''),
('site_url',''),
('candidate_link',''),
('agency_link',''),
('tone','')
on conflict (key) do nothing;
