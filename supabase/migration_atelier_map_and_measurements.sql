-- MALIXA — Atelier Map & AI Measurement Assistant
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- No local Supabase CLI/migrations tooling exists in this repo, so this file is
-- kept here for reference/history but must be applied manually.

-- ─────────────────────────────────────────────────────────────────────────
-- Feature 1: atelier location + cover image
-- ─────────────────────────────────────────────────────────────────────────
alter table creator_profiles
  add column if not exists wilaya      text,
  add column if not exists commune     text,
  add column if not exists address     text,
  add column if not exists latitude    double precision,
  add column if not exists longitude   double precision,
  add column if not exists cover_image text;

create index if not exists idx_creator_profiles_wilaya  on creator_profiles (wilaya);
create index if not exists idx_creator_profiles_lat_lng on creator_profiles (latitude, longitude);

-- ─────────────────────────────────────────────────────────────────────────
-- Feature 2: saved measurement profiles
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists saved_measurements (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  label            text not null,        -- "Me" / "Sister" / "Mother" — lets one user keep multiple profiles apart
  height           numeric not null,
  bust             numeric not null,
  waist            numeric not null,
  hips             numeric not null,
  age              integer,
  weight           numeric,
  dress_type       text,
  recommended_size text,
  ai_confidence    numeric,
  ai_analysis      text,
  ai_warnings      jsonb,
  ai_suggestions   jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_saved_measurements_user_id on saved_measurements (user_id);

alter table saved_measurements enable row level security;

drop policy if exists "select own measurement profiles" on saved_measurements;
create policy "select own measurement profiles" on saved_measurements
  for select using (auth.uid() = user_id);

drop policy if exists "insert own measurement profiles" on saved_measurements;
create policy "insert own measurement profiles" on saved_measurements
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own measurement profiles" on saved_measurements;
create policy "update own measurement profiles" on saved_measurements
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own measurement profiles" on saved_measurements;
create policy "delete own measurement profiles" on saved_measurements
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Feature 2: order integration
-- ─────────────────────────────────────────────────────────────────────────
alter table orders
  add column if not exists measurement_profile_id uuid references saved_measurements(id) on delete set null,
  add column if not exists measurements_snapshot  jsonb;

-- No new RLS needed on `orders` — insert already requires client_id = auth.uid()
-- via existing policies, and this migration only adds nullable columns to it.
