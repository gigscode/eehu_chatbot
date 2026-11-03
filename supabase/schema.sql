-- Run this once in your Supabase project: Dashboard > SQL Editor > New query

-- Stores each chat session
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  created_at timestamptz default now()
);

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
create unique index if not exists conversations_session_id_idx on conversations (session_id);

-- Enable Row Level Security (read-only from the browser, writes only via service role)
alter table conversations enable row level security;
alter table messages enable row level security;

-- Allow the anon key to insert (so the chat widget can save messages)
create policy "Allow anon insert conversations"
  on conversations for insert to anon with check (true);

create policy "Allow anon insert messages"
  on messages for insert to anon with check (true);

-- Only the service role (your dashboard / server) can read
create policy "Allow service role read conversations"
  on conversations for select to service_role using (true);

create policy "Allow service role read messages"
  on messages for select to service_role using (true);
