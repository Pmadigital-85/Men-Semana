-- ═══════════════════════════════════════════════════════════
--  MenúSemana — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- 1. USER PROFILES
--    Created automatically when a user signs up (via trigger below)
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  display_name  text,
  plan          text not null default 'free',   -- 'free' | 'pro' | 'family'
  stripe_customer_id  text,                     -- filled in Phase 3
  stripe_subscription_id text,                  -- filled in Phase 3
  plan_expires_at timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. USER DATA (menu, prices, shopping lists, etc.)
--    One row per key per user — simple key/value store
create table if not exists public.user_data (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  key         text not null,         -- 'menu' | 'prices' | 'products' | 'supermarkets' | 'savedWeeks'
  value       jsonb,
  updated_at  timestamptz default now(),
  unique (user_id, key)
);

-- 3. INDEXES for fast queries
create index if not exists idx_user_data_user_id on public.user_data(user_id);
create index if not exists idx_profiles_stripe on public.profiles(stripe_customer_id);

-- ── ROW LEVEL SECURITY (RLS) ────────────────────────────────
-- Each user can only read/write their own data. Critical for security.

alter table public.profiles  enable row level security;
alter table public.user_data enable row level security;

-- Profiles: users see and edit only their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- User data: users see and edit only their own rows
create policy "Users can manage own data"
  on public.user_data for all using (auth.uid() = user_id);

-- ── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────
-- This runs automatically when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'free'
  );
  return new;
end;
$$;

-- Drop trigger if it exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── HELPER: upgrade a user plan (called from Stripe webhook in Phase 3) ──
create or replace function public.upgrade_user_plan(
  p_user_id uuid,
  p_plan text,
  p_stripe_customer text,
  p_stripe_sub text,
  p_expires_at timestamptz
)
returns void language plpgsql security definer as $$
begin
  update public.profiles set
    plan = p_plan,
    stripe_customer_id = p_stripe_customer,
    stripe_subscription_id = p_stripe_sub,
    plan_expires_at = p_expires_at,
    updated_at = now()
  where id = p_user_id;
end;
$$;
