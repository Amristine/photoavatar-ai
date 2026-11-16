-- PhotoAvatar AI initial schema
-- Apply in the Supabase SQL editor. API writes should use a server-side service role only.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null,
  balance_after bigint,
  transaction_type text not null check (transaction_type in ('purchase', 'reservation', 'generation_charge', 'refund', 'adjustment')),
  reference_id uuid,
  description text,
  idempotency_key text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.avatars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  provider text not null default 'heygen' check (provider = 'heygen'),
  provider_avatar_id text,
  source_asset_path text,
  status text not null default 'pending' check (status in ('pending', 'ready', 'failed', 'archived')),
  consent_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  avatar_id uuid references public.avatars(id) on delete set null,
  provider text not null default 'heygen' check (provider = 'heygen'),
  provider_job_id text unique,
  model_id text not null check (model_id in ('avatar-iii', 'avatar-iv', 'avatar-6', 'avatar-6-turbo')),
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  duration_seconds integer not null check (duration_seconds between 1 and 1800),
  resolution text not null default '1080p' check (resolution in ('720p', '1080p', '2k')),
  aspect_ratio text not null default '9:16' check (aspect_ratio in ('9:16', '16:9', '1:1')),
  photo_asset_path text,
  audio_asset_path text,
  script_text text,
  motion_prompt text,
  output_path text,
  estimated_provider_cost_usd numeric(12,4),
  actual_provider_cost_usd numeric(12,4),
  reserved_credits bigint not null default 0 check (reserved_credits >= 0),
  charged_credits bigint not null default 0 check (charged_credits >= 0),
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.model_pricing (
  model_id text primary key check (model_id in ('avatar-iii', 'avatar-iv', 'avatar-6', 'avatar-6-turbo')),
  provider_usd_per_minute numeric(12,4),
  customer_credits_per_minute bigint,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.model_pricing (model_id, provider_usd_per_minute, customer_credits_per_minute, enabled)
values
  ('avatar-iii', 0.99, null, true),
  ('avatar-iv', 2.31, null, true),
  ('avatar-6', null, null, false),
  ('avatar-6-turbo', null, null, false)
on conflict (model_id) do nothing;

create index if not exists generations_user_created_idx on public.generations(user_id, created_at desc);
create index if not exists credit_transactions_user_created_idx on public.credit_transactions(user_id, created_at desc);
create index if not exists avatars_user_created_idx on public.avatars(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.avatars enable row level security;
alter table public.generations enable row level security;
alter table public.model_pricing enable row level security;

create policy "Users can read their own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Users can update their own display name" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can read their own wallet" on public.wallets
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can read their own credit transactions" on public.credit_transactions
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can read their own avatars" on public.avatars
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can read their own generations" on public.generations
  for select to authenticated using (auth.uid() = user_id);
create policy "Authenticated users can read enabled model prices" on public.model_pricing
  for select to authenticated using (enabled = true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email))
  on conflict (id) do nothing;

  insert into public.wallets (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Intentionally no client-side INSERT/UPDATE/DELETE policies on wallets,
-- transactions, generations or model_pricing. Perform billing and provider
-- operations only from authenticated server routes using a service-role key.
