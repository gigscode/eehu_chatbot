-- Run this once in your Supabase project: Dashboard > SQL Editor > New query

-- Stores each chat session and enquiry pipeline status
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  lead_name text,
  lead_contact text,
  lead_service text,
  status text default 'new' check (status in ('new', 'contacted', 'quote_sent', 'won', 'lost')),
  deal_value numeric default 0,
  notes text,
  follow_up_date timestamptz,
  next_action text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Migration helpers for existing databases
alter table conversations add column if not exists lead_name text;
alter table conversations add column if not exists lead_contact text;
alter table conversations add column if not exists lead_service text;
alter table conversations add column if not exists status text default 'new';
alter table conversations add column if not exists deal_value numeric default 0;
alter table conversations add column if not exists notes text;
alter table conversations add column if not exists follow_up_date timestamptz;
alter table conversations add column if not exists next_action text;
alter table conversations add column if not exists updated_at timestamptz default now();

-- Stores each individual message within a session
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text not null check (role in ('user', 'agent')),
  text text not null,
  created_at timestamptz default now()
);

-- Index for fast lookup by session
create index if not exists messages_session_id_idx on messages (session_id);
-- Use a distinct name so an older non-unique index with the previous name
-- cannot cause IF NOT EXISTS to skip creating the required unique index.
create unique index if not exists conversations_session_id_unique_idx on conversations (session_id);

-- Restore conversation rows for messages saved before conversation upserts worked.
insert into conversations (session_id)
select distinct m.session_id
from messages m
where m.session_id is not null
on conflict (session_id) do nothing;

-- Enable Row Level Security (read-only from the browser, writes only via service role)
alter table conversations enable row level security;
alter table messages enable row level security;

-- Chat writes go through server routes using the service role key.
-- Do not allow unauthenticated clients to write chat or lead records directly.
drop policy if exists "Allow anon insert conversations" on conversations;
drop policy if exists "Allow anon insert messages" on messages;
drop policy if exists "Allow anon update conversations" on conversations;

-- Only the service role (your dashboard / server) can read
drop policy if exists "Allow service role read conversations" on conversations;
create policy "Allow service role read conversations"
  on conversations for select to service_role using (true);

drop policy if exists "Allow service role read messages" on messages;
create policy "Allow service role read messages"
  on messages for select to service_role using (true);

-- Allow service role to update pipeline status, notes, and deal values
drop policy if exists "Allow service role update conversations" on conversations;
create policy "Allow service role update conversations"
  on conversations for update to service_role using (true) with check (true);
