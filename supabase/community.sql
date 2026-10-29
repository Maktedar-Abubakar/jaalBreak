-- ===========================================================================
-- JaalBreak community scam reports (v1.2)
-- Run this ONCE in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
-- What it stores: ONLY the scam type, the risk level, tactic names, language
-- and where the message arrived (SMS, WhatsApp…). Never the message, links,
-- numbers, names, or who reported it.
--
-- Who can do what:
--   - Anyone (guest or signed in) can ADD an anonymous report.
--   - Nobody can READ individual rows (there is no SELECT policy).
--   - Everyone can read only the AGGREGATED counts, through the two functions
--     at the bottom.
-- ===========================================================================

create table if not exists public.community_reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  category text not null check (category in (
    'bank_kyc','job_fee','delivery_fee','family_emergency','prize_reward','investment_task',
    'authority_threat','tech_support','utility_bill','blackmail','account_takeover',
    'fake_challan','fake_loan','general','unclassified')),
  band text not null check (band in ('medium','high')),
  tactics text[] not null default '{}' check (cardinality(tactics) <= 20),
  channel text not null default 'other' check (channel in (
    'sms','whatsapp','instagram','facebook','telegram','email','call','other')),
  language text check (char_length(language) <= 40),
  rules_version text check (char_length(rules_version) <= 20)
);

alter table public.community_reports enable row level security;

drop policy if exists "Anyone can add an anonymous report" on public.community_reports;
create policy "Anyone can add an anonymous report"
  on public.community_reports for insert
  to anon, authenticated
  with check (true);

-- No select / update / delete policies: individual rows stay private.

create index if not exists community_reports_created_idx on public.community_reports (created_at desc);

-- Top scam types in the last N days (1–90). Aggregates only.
create or replace function public.trending_scams(days int default 7)
returns table (category text, reports bigint)
language sql
stable
security definer
set search_path = public
as $$
  select category, count(*)::bigint as reports
  from public.community_reports
  where created_at > now() - make_interval(days => least(greatest(days, 1), 90))
  group by category
  order by reports desc
  limit 15;
$$;

-- Reports per day for the last N days (1–90). Aggregates only.
create or replace function public.trending_daily(days int default 14)
returns table (day date, reports bigint)
language sql
stable
security definer
set search_path = public
as $$
  select (created_at at time zone 'Asia/Kolkata')::date as day, count(*)::bigint as reports
  from public.community_reports
  where created_at > now() - make_interval(days => least(greatest(days, 1), 90))
  group by 1
  order by 1;
$$;

revoke all on function public.trending_scams(int) from public;
revoke all on function public.trending_daily(int) from public;
grant execute on function public.trending_scams(int) to anon, authenticated;
grant execute on function public.trending_daily(int) to anon, authenticated;
