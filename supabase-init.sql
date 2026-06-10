-- Supabase / PostgreSQL init SQL for Subscription Key Manager
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) after selecting your project.

-- 1) Enable pgcrypto for UUID generation (if not already enabled)
create extension if not exists "pgcrypto";

-- 2) Create license keys table
create table if not exists public.license_keys (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  client_name text,
  duration text,
  status text,
  permissions text[],
  created_at timestamptz default now(),
  activated_at timestamptz,
  expires_at timestamptz,
  max_devices int,
  devices_used int default 0,
  notes text,
  created_by uuid -- optional FK to auth.users (store the owner uid)
);

-- 3) Create system logs table
create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz default now(),
  action text,
  client_name text,
  key_snippet text,
  type text
);

-- 4) Row-Level Security (RLS) - recommended to enable, but start with permissive policies for testing
alter table public.license_keys enable row level security;
alter table public.system_logs enable row level security;

-- Allow authenticated users to SELECT (for testing). Service role bypasses RLS so scripts still work.
create policy if not exists "allow_authenticated_select_license_keys" on public.license_keys
  for select using (auth.role() = 'authenticated');

create policy if not exists "allow_authenticated_insert_license_keys" on public.license_keys
  for insert with check (auth.role() = 'authenticated');

create policy if not exists "allow_authenticated_select_system_logs" on public.system_logs
  for select using (auth.role() = 'authenticated');

create policy if not exists "allow_authenticated_insert_system_logs" on public.system_logs
  for insert with check (auth.role() = 'authenticated');

-- NOTE:
-- 1) The service_role key bypasses RLS and will be used by server-side scripts (example: create-admin) to insert/manage rows.
-- 2) For production tighten policies to check a user's role claim (e.g. admin) before allowing write/delete actions.
--    You can implement admin checks by setting a custom JWT claim or storing role in auth.users.user_metadata and
--    consulting it via policies (advanced). If you want, I can provide example policies that check user_metadata.role.
