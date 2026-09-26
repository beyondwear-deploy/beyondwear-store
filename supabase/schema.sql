-- BeyondWear — free Supabase backend schema (admin dashboard + inline editor)
-- Run this once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT everywhere).
--
-- This covers what the site uses TODAY: real order records, traffic
-- analytics and the "click Edit → Save" content editor. The product
-- catalogue itself is still static (src/lib/catalog.ts) — a separate,
-- more involved schema for migrating the catalogue into the database is
-- kept for later reference in supabase/schema-future-catalog-migration.sql
-- (not needed for the dashboard/editor — don't run it).

-- ─────────────────────────────────────────────────────────────────────────
-- Orders — the real, durable order record (replaces "email is the record").
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists orders (
  id            text primary key,               -- e.g. "SEQ-AB12CD"
  placed_at     timestamptz not null default now(),
  customer      jsonb not null,                  -- { fullName, phone, email }
  shipping      jsonb not null,                  -- { address, city, province, postalCode }
  delivery_method text not null,
  payment_method  text not null,
  payment_status  text not null,
  items         jsonb not null,                  -- OrderItem[]
  subtotal      numeric not null default 0,
  discount      numeric not null default 0,
  delivery_fee  numeric not null default 0,
  total         numeric not null default 0,
  promo_code    text,
  status        text not null default 'placed',  -- placed|confirmed|packed|shipped|out-for-delivery|delivered|cancelled
  created_at    timestamptz not null default now()
);
create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);

-- ─────────────────────────────────────────────────────────────────────────
-- Page views — powers the traffic-analytics dashboard.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists page_views (
  id          bigserial primary key,
  path        text not null,
  referrer    text,
  device      text,          -- mobile | desktop | tablet
  browser     text,
  visitor_id  text,          -- anonymous, cookie-based, no PII
  session_id  text,
  created_at  timestamptz not null default now()
);
create index if not exists page_views_created_at_idx on page_views (created_at desc);
create index if not exists page_views_path_idx on page_views (path);
create index if not exists page_views_visitor_idx on page_views (visitor_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Content overrides — backs the "click Edit → Save" inline editor.
-- One row per editable field on the site, keyed by a stable string id
-- (e.g. "announcement.0", "about.story.p1", "about.photo").
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists content_overrides (
  key         text primary key,
  type        text not null,        -- 'text' | 'image'
  value       text not null,
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Storage bucket for images uploaded through the inline editor.
-- storage.buckets is a normal table, so this creates the bucket for you —
-- no need to click around the Storage UI. Public read (product/site images
-- are meant to be public), writes go only through the server (service role
-- key), never directly from the browser.
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('site-content', 'site-content', true)
on conflict (id) do nothing;

-- Row Level Security: lock every table down from the public/anon key.
-- The app only ever talks to these tables using the SERVICE ROLE key on the
-- server (in API routes), which bypasses RLS entirely — so these policies
-- exist purely as a safety net in case the anon/public key is ever used.
alter table orders enable row level security;
alter table page_views enable row level security;
alter table content_overrides enable row level security;

drop policy if exists "no public access" on orders;
create policy "no public access" on orders for all using (false);
drop policy if exists "no public access" on page_views;
create policy "no public access" on page_views for all using (false);
drop policy if exists "public read" on content_overrides;
create policy "public read" on content_overrides for select using (true);
drop policy if exists "no public insert" on content_overrides;
create policy "no public insert" on content_overrides for insert with check (false);
drop policy if exists "no public update" on content_overrides;
create policy "no public update" on content_overrides for update using (false);
drop policy if exists "no public delete" on content_overrides;
create policy "no public delete" on content_overrides for delete using (false);
