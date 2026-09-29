create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  message text not null,
  team_size text,
  budget text,
  source text,
  created_at timestamptz not null default now()
);

-- RLS on with no policies: anon/authenticated roles cannot read or write.
-- The server route uses the service role key, which bypasses RLS.
alter table public.leads enable row level security;
