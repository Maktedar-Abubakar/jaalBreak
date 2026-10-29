-- ===========================================================================
-- ScamShield — Supabase database setup
--
-- HOW TO RUN: Supabase Dashboard -> your project -> SQL Editor -> New query
--             -> paste this whole file -> Run.
-- Safe to run more than once (it drops and recreates its own policies).
--
-- What it creates:
--   public.profiles      one row per user: their full name
--   public.scan_history  one row per saved analysis: SUMMARY ONLY
--                        (no message text, screenshots, links, Aadhaar,
--                         bank or card details are ever stored)
--   Row Level Security   every user can only read/change their own rows
--   A trigger            creates the profile automatically at sign-up
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. PROFILES
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text check (full_name is null or char_length(full_name) <= 100),
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'ScamShield: display name for each signed-up user.';

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own"   on public.profiles;
drop policy if exists "profiles: insert own" on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;
drop policy if exists "profiles: delete own" on public.profiles;

create policy "profiles: read own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: insert own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "profiles: delete own" on public.profiles
  for delete to authenticated
  using ((select auth.uid()) = id);


-- ---------------------------------------------------------------------------
-- 2. Create a profile automatically when someone signs up.
--    Reads the full name the app sends as user metadata ("full_name").
--    SECURITY DEFINER lets it write to profiles; search_path is pinned so it
--    can't be hijacked, and normal users are not allowed to call it directly.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_name text;
begin
  -- Plain string handling only. Do NOT use NULLIF here: on this project it made
  -- signup fail ("Database error saving new user", 21 Oct 2026).
  clean_name := btrim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  if clean_name = '' then
    clean_name := null;
  else
    clean_name := substr(clean_name, 1, 100);
  end if;

  insert into public.profiles (id, full_name)
  values (new.id, clean_name)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 3. SCAN HISTORY (summaries only)
--    Columns mirror what the Analysis History page already shows.
-- ---------------------------------------------------------------------------
create table if not exists public.scan_history (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  risk_level      text not null check (risk_level in ('low', 'medium', 'high')),
  risk_label      text check (risk_label is null or char_length(risk_label) <= 120),
  scam_category   text check (scam_category is null or char_length(scam_category) <= 60),
  category_label  text check (category_label is null or char_length(category_label) <= 120),
  matched_checks  integer not null default 0 check (matched_checks between 0 and 1000),
  tactics         text[] not null default '{}' check (cardinality(tactics) <= 20),
  input_source    text check (input_source is null or input_source in ('pasted', 'screenshot', 'sample')),
  language        text check (language is null or char_length(language) <= 40),
  rules_version   text check (rules_version is null or char_length(rules_version) <= 20),
  analyzed_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

comment on table public.scan_history is
  'ScamShield: per-user analysis summaries. Never stores message text or other sensitive content.';

-- Fast "my latest checks" query.
create index if not exists scan_history_user_created_idx
  on public.scan_history (user_id, created_at desc);

alter table public.scan_history enable row level security;

drop policy if exists "scan_history: read own"   on public.scan_history;
drop policy if exists "scan_history: insert own" on public.scan_history;
drop policy if exists "scan_history: update own" on public.scan_history;
drop policy if exists "scan_history: delete own" on public.scan_history;

create policy "scan_history: read own" on public.scan_history
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "scan_history: insert own" on public.scan_history
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "scan_history: update own" on public.scan_history
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "scan_history: delete own" on public.scan_history
  for delete to authenticated
  using ((select auth.uid()) = user_id);


-- ---------------------------------------------------------------------------
-- 4. Belt and braces: signed-out visitors (the "anon" role) get no access to
--    these tables at all, even before RLS is considered. Guests in ScamShield
--    never talk to the database — their history stays in their browser.
-- ---------------------------------------------------------------------------
revoke all on table public.profiles     from anon;
revoke all on table public.scan_history from anon;

grant select, insert, update, delete on table public.profiles     to authenticated;
grant select, insert, update, delete on table public.scan_history to authenticated;


-- ---------------------------------------------------------------------------
-- 5. Optional check — run separately after the script. Both rows should show
--    rowsecurity = true.
--
--   select tablename, rowsecurity from pg_tables
--   where schemaname = 'public' and tablename in ('profiles', 'scan_history');
-- ---------------------------------------------------------------------------
