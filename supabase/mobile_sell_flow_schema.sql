-- Sellkar mobile sell-flow schema alignment
-- Reuse and extend existing customer_profiles, leads, and pickup_requests tables.

begin;

create extension if not exists pgcrypto;

create table if not exists public.customer_profiles (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone_number text not null unique,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles
  add column if not exists name text,
  add column if not exists phone_number text,
  add column if not exists city text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists customer_profiles_phone_number_uidx
  on public.customer_profiles (phone_number);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  name text,
  device_interest text,
  source text not null default 'app',
  status text not null default 'lead',
  created_at timestamptz not null default now()
);

alter table public.leads
  add column if not exists phone_number text,
  add column if not exists name text,
  add column if not exists device_interest text,
  add column if not exists source text default 'app',
  add column if not exists status text default 'lead',
  add column if not exists created_at timestamptz default now();

create index if not exists leads_phone_created_idx
  on public.leads (phone_number, created_at desc);

create table if not exists public.pickup_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customer_profiles(id) on delete cascade,
  device_name text not null,
  device_variant text,
  condition_answers jsonb not null default '{}'::jsonb,
  price_final numeric(12,2) not null,
  pickup_address text not null,
  city text not null,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

alter table public.pickup_requests
  add column if not exists customer_id uuid references public.customer_profiles(id) on delete cascade,
  add column if not exists device_name text,
  add column if not exists device_variant text,
  add column if not exists condition_answers jsonb default '{}'::jsonb,
  add column if not exists price_final numeric(12,2),
  add column if not exists pickup_address text,
  add column if not exists city text,
  add column if not exists status text default 'scheduled',
  add column if not exists created_at timestamptz default now();

create index if not exists pickup_requests_customer_created_idx
  on public.pickup_requests (customer_id, created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pickup_requests_status_chk'
  ) then
    alter table public.pickup_requests
      add constraint pickup_requests_status_chk
      check (status in ('scheduled', 'picked', 'completed'));
  end if;
end
$$;

alter table public.customer_login_history
  add column if not exists customer_id uuid references public.customer_profiles(id) on delete set null,
  add column if not exists phone_number text,
  add column if not exists event text,
  add column if not exists source text,
  add column if not exists created_at timestamptz default now();

alter table public.customer_activity_history
  add column if not exists customer_id uuid references public.customer_profiles(id) on delete cascade,
  add column if not exists action text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists source text,
  add column if not exists created_at timestamptz default now();

commit;
