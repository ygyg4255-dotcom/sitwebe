-- ═══════════════════════════════════════════════════════════════════
-- SiteWib — ONE-PASTE SETUP BUNDLE (generated, do not edit)
--
-- This file is an exact concatenation, in order, of:
--   supabase/migrations/0001_profiles_and_settings.sql
--   supabase/migrations/0002_catalog_tables.sql
--   supabase/migrations/0003_engagement_tables.sql
--   supabase/migrations/0004_rls_policies.sql
--   supabase/migrations/0005_storage_bucket.sql
--   supabase/seed.sql
--
-- Purpose: paste this ONCE into the Supabase SQL Editor on a fresh
-- project and run it — it creates all 11 tables, the RLS policies,
-- the storage bucket and the demo data in a single step.
--
-- Safe to RE-RUN at any time, even if a previous attempt failed
-- halfway: tables and indexes use IF NOT EXISTS, functions are
-- CREATE OR REPLACE, triggers and policies are dropped and recreated
-- (metadata only — never touches data), and every seed insert is
-- idempotent. Existing data is never modified or deleted.
--
-- If any migration changes, regenerate this file from the sources
-- (npm run bundle) — do not hand-edit it.
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- BEGIN FILE: supabase/migrations/0001_profiles_and_settings.sql
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- SiteWib — Migration 0001: Staff profiles & site settings
--
-- Run migrations in order in the Supabase SQL Editor:
--   0001 → 0002 → 0003 → 0004 → 0005, then run seed.sql
-- ═══════════════════════════════════════════════════════════════════

-- ── profiles ────────────────────────────────────────────────────────
-- One row per staff member (admin or editor). Rows are created
-- automatically when a user is added in Supabase → Authentication →
-- Users (see the trigger at the bottom of this block).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default 'Membre',
  role        text not null default 'editor' check (role in ('admin', 'editor')),
  created_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Staff accounts. One row per Supabase Auth user; role is admin or editor.';

-- Automatically create the profile row whenever a new auth user is
-- created (e.g. from the Supabase dashboard "Add user" button).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Membre de l''équipe')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── site_settings ────────────────────────────────────────────────────
-- The white-label source of truth: ALL client branding, colors,
-- contact and social data live in this single row. The check on `id`
-- guarantees the table can never contain more than one row.
create table if not exists public.site_settings (
  id                 int primary key default 1 check (id = 1),
  agency_name        text not null default 'Atlas Voyages',
  tagline            text,
  logo_url           text,
  -- Brand colors (applied at runtime as CSS variables — see lib/config/site.ts)
  primary_color      text not null default '#c0532e',  -- Terracotta
  primary_dark_color text not null default '#9a3f1f',
  accent_color       text not null default '#d9a441',  -- Saffron gold
  secondary_color    text not null default '#2e6e6a',  -- Atlas teal
  ink_color          text not null default '#2b2118',
  paper_color        text not null default '#faf5ec',
  sand_color         text not null default '#f1e5d0',
  surface_color      text not null default '#fffdf8',
  muted_color        text not null default '#7c6f60',
  border_color      text not null default '#e5d9c5',
  -- Contact
  phone              text,
  whatsapp           text,
  email              text,
  address            text,
  city               text,
  -- Social links (nullable = hidden)
  facebook_url       text,
  instagram_url      text,
  tripadvisor_url    text,
  -- Localization
  default_locale     text not null default 'fr',
  updated_at         timestamptz not null default now()
);

comment on table public.site_settings is
  'White-label branding & contact data. Always exactly one row (id = 1).';

-- END FILE: supabase/migrations/0001_profiles_and_settings.sql

-- ═══════════════════════════════════════════════════════════════════
-- BEGIN FILE: supabase/migrations/0002_catalog_tables.sql
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- SiteWib — Migration 0002: Tour catalog
-- destinations, tours, tour_itinerary, tour_departures
-- Run AFTER 0001.
-- ═══════════════════════════════════════════════════════════════════

-- ── destinations ─────────────────────────────────────────────────────
-- Regions the agency covers (Marrakech, Sahara, Chefchaouen, …).
create table if not exists public.destinations (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name_fr        text not null,
  name_en        text,
  name_ar        text,
  description_fr text,
  description_en text,
  description_ar text,
  image_url      text,
  is_published   boolean not null default true,
  sort_order     int not null default 0
);

comment on table public.destinations is
  'Regions the agency operates in. *_en / *_ar columns are optional — French-first.';

-- ── tours ────────────────────────────────────────────────────────────
-- The core product: a tour or travel package.
create table if not exists public.tours (
  id                  uuid primary key default gen_random_uuid(),
  destination_id     uuid references public.destinations (id) on delete set null,
  slug                text unique not null,
  title_fr            text not null,
  title_en            text,
  title_ar            text,
  summary_fr          text,
  summary_en          text,
  summary_ar          text,
  description_fr      text,
  description_en      text,
  description_ar      text,
  price_mad           numeric(10, 2) not null check (price_mad >= 0),
  duration_days       int not null default 1 check (duration_days >= 1),
  group_size_max      int check (group_size_max >= 1),
  difficulty          text not null default 'easy'
                      check (difficulty in ('easy', 'moderate', 'challenging')),
  cover_image_url     text,
  gallery_urls        text[] not null default '{}',
  included            text[] not null default '{}',   -- what the price includes
  excluded            text[] not null default '{}',  -- what it does not
  is_published        boolean not null default false,
  is_featured         boolean not null default false,
  departure_location  text,
  return_location     text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.tours is
  'Core product: tours/packages. Draft until is_published, shown on the home page when is_featured.';

create index if not exists tours_published_featured_idx on public.tours (is_published, is_featured);
create index if not exists tours_destination_idx on public.tours (destination_id);

-- Keep updated_at current automatically on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tours_set_updated_at on public.tours;
create trigger tours_set_updated_at
  before update on public.tours
  for each row execute function public.set_updated_at();

-- ── tour_itinerary ───────────────────────────────────────────────────
-- Day-by-day program of a tour. Deleted with its tour (cascade).
create table if not exists public.tour_itinerary (
  id             uuid primary key default gen_random_uuid(),
  tour_id        uuid not null references public.tours (id) on delete cascade,
  day_number     int not null check (day_number >= 1),
  title_fr       text not null,
  title_en       text,
  title_ar       text,
  description_fr text,
  description_en text,
  description_ar text,
  unique (tour_id, day_number)
);

comment on table public.tour_itinerary is
  'Day-by-day itinerary steps of a tour. One row per day.';

-- ── tour_departures ──────────────────────────────────────────────────
-- Scheduled departure dates for a tour, with optional per-date pricing.
create table if not exists public.tour_departures (
  id                  uuid primary key default gen_random_uuid(),
  tour_id             uuid not null references public.tours (id) on delete cascade,
  start_date          date not null,
  end_date            date not null,
  price_mad           numeric(10, 2) check (price_mad >= 0),
  max_participants    int check (max_participants >= 1),
  booked_participants int not null default 0 check (booked_participants >= 0),
  check (end_date >= start_date)
);

comment on table public.tour_departures is
  'Scheduled departure dates for a tour (optional per-date price and capacity).';

-- END FILE: supabase/migrations/0002_catalog_tables.sql

-- ═══════════════════════════════════════════════════════════════════
-- BEGIN FILE: supabase/migrations/0003_engagement_tables.sql
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- SiteWib — Migration 0003: Engagement tables
-- bookings, inquiries, testimonials, blog_posts, faqs
-- Run AFTER 0002.
-- ═══════════════════════════════════════════════════════════════════

-- ── bookings ─────────────────────────────────────────────────────────
-- Customer booking requests (inquiries, NOT payments — Phase 4+ may
-- add payments). Insertable by anyone (the booking form), readable and
-- manageable only by staff (enforced by RLS in migration 0004).
create table if not exists public.bookings (
  id                uuid primary key default gen_random_uuid(),
  tour_id           uuid references public.tours (id) on delete set null,
  departure_id      uuid references public.tour_departures (id) on delete set null,
  full_name         text not null,
  email             text not null,
  phone             text,
  travel_date       date,
  num_adults        int not null default 1 check (num_adults >= 1),
  num_children      int not null default 0 check (num_children >= 0),
  message           text,
  status            text not null default 'new'
                    check (status in ('new', 'contacted', 'confirmed', 'cancelled')),
  created_at        timestamptz not null default now()
);

comment on table public.bookings is
  'Booking requests from customers. Status workflow: new → contacted → confirmed / cancelled.';

create index if not exists bookings_status_created_idx on public.bookings (status, created_at);

-- ── inquiries ─────────────────────────────────────────────────────────
-- Simple contact form messages (not tied to a tour).
create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.inquiries is 'Contact form messages.';

-- ── testimonials ──────────────────────────────────────────────────────
create table if not exists public.testimonials (
  id             uuid primary key default gen_random_uuid(),
  author_name    text not null,
  author_country text,
  rating         int not null check (rating between 1 and 5),
  quote_fr       text not null,
  quote_en       text,
  quote_ar       text,
  avatar_url     text,
  is_published   boolean not null default true
);

comment on table public.testimonials is 'Customer reviews shown on the public site.';

-- ── blog_posts ───────────────────────────────────────────────────────
-- Markdown articles (SEO). *_en / *_ar optional — French-first.
create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title_fr        text not null,
  title_en        text,
  title_ar        text,
  excerpt_fr      text,
  excerpt_en      text,
  excerpt_ar      text,
  content_fr      text,
  content_en      text,
  content_ar      text,
  cover_image_url text,
  author_id       uuid references public.profiles (id) on delete set null,
  is_published    boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now()
);

comment on table public.blog_posts is 'Blog articles (Markdown content) for SEO.';

create index if not exists blog_posts_published_idx on public.blog_posts (is_published, published_at);

-- ── faqs ──────────────────────────────────────────────────────────────
create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question_fr  text not null,
  question_en  text,
  question_ar  text,
  answer_fr    text not null,
  answer_en    text,
  answer_ar    text,
  sort_order   int not null default 0,
  is_published boolean not null default true
);

comment on table public.faqs is 'Frequently asked questions shown on the public site.';

-- END FILE: supabase/migrations/0003_engagement_tables.sql

-- ═══════════════════════════════════════════════════════════════════
-- BEGIN FILE: supabase/migrations/0004_rls_policies.sql
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- SiteWib — Migration 0004: Row Level Security (RLS)
--
-- THE security layer of the project. The application never trusts its
-- own code to filter data — the database itself enforces who can read
-- and write what. Even a bug in the app code cannot leak or corrupt
-- data beyond these rules.
--
-- Rules summary (matching the approved architecture):
--   • PUBLIC      → can READ published content; can SUBMIT bookings
--                   and inquiries (insert-only, no read access)
--   • STAFF       → admin or editor: full read + write on content
--   • ADMIN       → additionally: manage profiles (roles), delete
--                   bookings/inquiries/settings
--
-- Run AFTER 0003.
--
-- Rerun-safe: every policy is dropped first (metadata only — dropping
-- and recreating a policy never touches table data), so this file can
-- be re-run on a database that already has the policies.
-- ═══════════════════════════════════════════════════════════════════

-- ── Helper functions ─────────────────────────────────────────────────
-- SECURITY DEFINER: the functions run with elevated privileges so they
-- can query `profiles` without triggering RLS recursion (profiles'
-- policies themselves call these functions).

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ──────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- NOTE on the update policy below: RLS policy expressions are plain
-- SQL — the OLD row record is NOT available there (it only exists
-- inside trigger functions; referencing it raises error 42P01). The
-- `with check` clause only sees the NEW row, so the user's CURRENT
-- role is fetched with a subquery against the table. That subquery
-- runs under the SELECT policy above: a user can read their own row
-- (id = auth.uid()), staff can read all rows. No recursion — the
-- SELECT policy only calls the SECURITY DEFINER helpers.

drop policy if exists "profiles: read own profile, staff reads all" on public.profiles;
create policy "profiles: read own profile, staff reads all"
  on public.profiles for select
  using (id = auth.uid() or public.is_staff());

drop policy if exists "profiles: insert own profile" on public.profiles;
create policy "profiles: insert own profile"
  on public.profiles for insert
  with check (id = auth.uid() or public.is_admin());

-- Users can edit their own row but NOT their own role; only admins
-- can change roles.
drop policy if exists "profiles: update own profile, only admins change roles" on public.profiles;
create policy "profiles: update own profile, only admins change roles"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (
    public.is_admin()
    or (
      id = auth.uid()
      and role = (
        select p.role from public.profiles p where p.id = auth.uid()
      )
    )
  );

drop policy if exists "profiles: admin delete" on public.profiles;
create policy "profiles: admin delete"
  on public.profiles for delete
  using (public.is_admin());

-- ── site_settings ────────────────────────────────────────────────────
alter table public.site_settings enable row level security;

drop policy if exists "settings: public read" on public.site_settings;
create policy "settings: public read"
  on public.site_settings for select
  using (true);

drop policy if exists "settings: staff insert" on public.site_settings;
create policy "settings: staff insert"
  on public.site_settings for insert
  with check (public.is_staff());

drop policy if exists "settings: staff update" on public.site_settings;
create policy "settings: staff update"
  on public.site_settings for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "settings: admin delete" on public.site_settings;
create policy "settings: admin delete"
  on public.site_settings for delete
  using (public.is_admin());

-- ── destinations ─────────────────────────────────────────────────────
alter table public.destinations enable row level security;

drop policy if exists "destinations: public reads published, staff reads all" on public.destinations;
create policy "destinations: public reads published, staff reads all"
  on public.destinations for select
  using (is_published or public.is_staff());

drop policy if exists "destinations: staff insert" on public.destinations;
create policy "destinations: staff insert"
  on public.destinations for insert
  with check (public.is_staff());

drop policy if exists "destinations: staff update" on public.destinations;
create policy "destinations: staff update"
  on public.destinations for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "destinations: staff delete" on public.destinations;
create policy "destinations: staff delete"
  on public.destinations for delete
  using (public.is_staff());

-- ── tours ─────────────────────────────────────────────────────────────
alter table public.tours enable row level security;

drop policy if exists "tours: public reads published, staff reads all" on public.tours;
create policy "tours: public reads published, staff reads all"
  on public.tours for select
  using (is_published or public.is_staff());

drop policy if exists "tours: staff insert" on public.tours;
create policy "tours: staff insert"
  on public.tours for insert
  with check (public.is_staff());

drop policy if exists "tours: staff update" on public.tours;
create policy "tours: staff update"
  on public.tours for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "tours: staff delete" on public.tours;
create policy "tours: staff delete"
  on public.tours for delete
  using (public.is_staff());

-- ── tour_itinerary ────────────────────────────────────────────────────
-- No own publish flag: readable by the public only while the PARENT
-- tour is published.
alter table public.tour_itinerary enable row level security;

drop policy if exists "itinerary: public reads when parent tour published" on public.tour_itinerary;
create policy "itinerary: public reads when parent tour published"
  on public.tour_itinerary for select
  using (
    public.is_staff()
    or exists (
      select 1 from public.tours t
      where t.id = tour_itinerary.tour_id and t.is_published
    )
  );

drop policy if exists "itinerary: staff insert" on public.tour_itinerary;
create policy "itinerary: staff insert"
  on public.tour_itinerary for insert
  with check (public.is_staff());

drop policy if exists "itinerary: staff update" on public.tour_itinerary;
create policy "itinerary: staff update"
  on public.tour_itinerary for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "itinerary: staff delete" on public.tour_itinerary;
create policy "itinerary: staff delete"
  on public.tour_itinerary for delete
  using (public.is_staff());

-- ── tour_departures ───────────────────────────────────────────────────
alter table public.tour_departures enable row level security;

drop policy if exists "departures: public reads when parent tour published" on public.tour_departures;
create policy "departures: public reads when parent tour published"
  on public.tour_departures for select
  using (
    public.is_staff()
    or exists (
      select 1 from public.tours t
      where t.id = tour_departures.tour_id and t.is_published
    )
  );

drop policy if exists "departures: staff insert" on public.tour_departures;
create policy "departures: staff insert"
  on public.tour_departures for insert
  with check (public.is_staff());

drop policy if exists "departures: staff update" on public.tour_departures;
create policy "departures: staff update"
  on public.tour_departures for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "departures: staff delete" on public.tour_departures;
create policy "departures: staff delete"
  on public.tour_departures for delete
  using (public.is_staff());

-- ── bookings ──────────────────────────────────────────────────────────
-- The key asymmetry: ANYONE may insert (submit the booking form), but
-- ONLY staff can ever read them. Customer data never leaks to the
-- public.
alter table public.bookings enable row level security;

drop policy if exists "bookings: public can submit" on public.bookings;
create policy "bookings: public can submit"
  on public.bookings for insert
  with check (true);

drop policy if exists "bookings: staff read" on public.bookings;
create policy "bookings: staff read"
  on public.bookings for select
  using (public.is_staff());

drop policy if exists "bookings: staff update status" on public.bookings;
create policy "bookings: staff update status"
  on public.bookings for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "bookings: admin delete" on public.bookings;
create policy "bookings: admin delete"
  on public.bookings for delete
  using (public.is_admin());

-- ── inquiries ─────────────────────────────────────────────────────────
alter table public.inquiries enable row level security;

drop policy if exists "inquiries: public can submit" on public.inquiries;
create policy "inquiries: public can submit"
  on public.inquiries for insert
  with check (true);

drop policy if exists "inquiries: staff read" on public.inquiries;
create policy "inquiries: staff read"
  on public.inquiries for select
  using (public.is_staff());

drop policy if exists "inquiries: staff update" on public.inquiries;
create policy "inquiries: staff update"
  on public.inquiries for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "inquiries: admin delete" on public.inquiries;
create policy "inquiries: admin delete"
  on public.inquiries for delete
  using (public.is_admin());

-- ── testimonials ──────────────────────────────────────────────────────
alter table public.testimonials enable row level security;

drop policy if exists "testimonials: public reads published, staff reads all" on public.testimonials;
create policy "testimonials: public reads published, staff reads all"
  on public.testimonials for select
  using (is_published or public.is_staff());

drop policy if exists "testimonials: staff insert" on public.testimonials;
create policy "testimonials: staff insert"
  on public.testimonials for insert
  with check (public.is_staff());

drop policy if exists "testimonials: staff update" on public.testimonials;
create policy "testimonials: staff update"
  on public.testimonials for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "testimonials: staff delete" on public.testimonials;
create policy "testimonials: staff delete"
  on public.testimonials for delete
  using (public.is_staff());

-- ── blog_posts ────────────────────────────────────────────────────────
alter table public.blog_posts enable row level security;

drop policy if exists "blog: public reads published, staff reads all" on public.blog_posts;
create policy "blog: public reads published, staff reads all"
  on public.blog_posts for select
  using (
    (is_published and published_at is not null and published_at <= now())
    or public.is_staff()
  );

drop policy if exists "blog: staff insert" on public.blog_posts;
create policy "blog: staff insert"
  on public.blog_posts for insert
  with check (public.is_staff());

drop policy if exists "blog: staff update" on public.blog_posts;
create policy "blog: staff update"
  on public.blog_posts for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "blog: staff delete" on public.blog_posts;
create policy "blog: staff delete"
  on public.blog_posts for delete
  using (public.is_staff());

-- ── faqs ──────────────────────────────────────────────────────────────
alter table public.faqs enable row level security;

drop policy if exists "faqs: public reads published, staff reads all" on public.faqs;
create policy "faqs: public reads published, staff reads all"
  on public.faqs for select
  using (is_published or public.is_staff());

drop policy if exists "faqs: staff insert" on public.faqs;
create policy "faqs: staff insert"
  on public.faqs for insert
  with check (public.is_staff());

drop policy if exists "faqs: staff update" on public.faqs;
create policy "faqs: staff update"
  on public.faqs for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "faqs: staff delete" on public.faqs;
create policy "faqs: staff delete"
  on public.faqs for delete
  using (public.is_staff());

-- END FILE: supabase/migrations/0004_rls_policies.sql

-- ═══════════════════════════════════════════════════════════════════
-- BEGIN FILE: supabase/migrations/0005_storage_bucket.sql
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- SiteWib — Migration 0005: Storage bucket for media
--
-- One public bucket "media" holds all client imagery:
--   media/tours/<tour-slug>/…      tour covers & galleries
--   media/destinations/…            destination photos
--   media/branding/logo.png        agency logo
--
-- Read access: public (the bucket is public).
-- Write access: staff only (enforced by RLS below).
-- Run AFTER 0004.
-- ═══════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Policies on storage.objects, scoped to the "media" bucket.
-- NOTE: storage.objects already has RLS enabled by Supabase.
-- Rerun-safe: policies are dropped first (metadata only).

drop policy if exists "media: public read" on storage.objects;
create policy "media: public read"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "media: staff upload" on storage.objects;
create policy "media: staff upload"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "media: staff update" on storage.objects;
create policy "media: staff update"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_staff())
  with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "media: staff delete" on storage.objects;
create policy "media: staff delete"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_staff());

-- END FILE: supabase/migrations/0005_storage_bucket.sql

-- ═══════════════════════════════════════════════════════════════════
-- BEGIN FILE: supabase/seed.sql
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- SiteWib — Seed data: "Atlas Voyages" (FICTIONAL demo agency)
--
-- Run AFTER migrations 0001–0005, once, in the Supabase SQL Editor.
-- Safe to re-run: keyed inserts use ON CONFLICT DO NOTHING; tables
-- without a natural unique key (testimonials, faqs, tour_departures)
-- use a NOT EXISTS guard instead.
-- Contains NO real client data by design — it exists to be replaced.
-- ═══════════════════════════════════════════════════════════════════

-- ── Site settings (the one row) ──────────────────────────────────────
insert into public.site_settings (
  id, agency_name, tagline,
  phone, whatsapp, email, address, city,
  facebook_url, instagram_url, tripadvisor_url
) values (
  1, 'Atlas Voyages', 'Circuits sur mesure au Maroc',
  '+212 5 24 00 00 00', '212600000000', 'contact@atlasvoyages-demo.ma',
  '12 Rue Riad Zitoun, Médina', 'Marrakech',
  'https://facebook.com/example', 'https://instagram.com/example', 'https://tripadvisor.com/example'
)
on conflict (id) do nothing;

-- ── Destinations ─────────────────────────────────────────────────────
insert into public.destinations (slug, name_fr, description_fr, sort_order) values
  ('marrakech', 'Marrakech',
   'La ville rouge : médina vivante, jardins secrets et la place Jemaa el-Fna au coucher du soleil.', 1),
  ('merzouga', 'Désert de Merzouga',
   'L''erg Chebbi : dunes dorées à perte de vue, bivouacs berbères et nuits étoilées inoubliables.', 2),
  ('chefchaouen', 'Chefchaouen',
   'La perle bleue du Rif, ses ruelles azur et ses montagnes parfumées à la menthe fraîche.', 3),
  ('fes', 'Fès',
   'La capitale spirituelle : la médina la plus ancienne du monde, tanneries millénaires et artisanat vivant.', 4),
  ('essaouira', 'Essaouira',
   'Port atlantique battu par les alizés : remparts portugais, poissons grillés et vibe bohème.', 5),
  ('atlas-ouzoud', 'Atlas & Ouzoud',
   'Vallées berbères, cols vertigineux et les cascades d''Ouzoud au cœur des montagnes.', 6)
on conflict (slug) do nothing;

-- ── Tours ────────────────────────────────────────────────────────────
insert into public.tours (
  slug, destination_id, title_fr, summary_fr, description_fr,
  price_mad, duration_days, group_size_max, difficulty,
  is_published, is_featured,
  included, excluded,
  departure_location, return_location
) values
  (
    'sahara-merzouga-3-jours',
    (select id from public.destinations where slug = 'merzouga'),
    'Désert du Sahara — 3 jours',
    'Traversée du col du Tichka, vallée du Dadès, dunes de Merzouga et une nuit sous les étoiles en bivouac berbère.',
    'Trois jours pour rejoindre le grand désert : le col du Tizi n''Tichka, la kasbah d''Aït Ben Haddou, les gorges du Dadès, puis les dunes de l''erg Chebbi à dos de dromadaire au coucher du soleil. Nuit en bivouac traditionnel, réveil au lever du soleil sur les dunes, retour par la vallée du Ziz.',
    1890.00, 3, 12, 'moderate',
    true, true,
    array ['Transport 4x4 climatisé', 'Guide local francophone', 'Nuit en bivouac', '2 nuits hôtel + 1 nuit bivouac', 'Petits-déjeuners et dîners'],
    array ['Déjeuners', 'Pourboires', 'Activités optionnelles'],
    'Marrakech', 'Marrakech'
  ),
  (
    'fes-meknes-2-jours',
    (select id from public.destinations where slug = 'fes'),
    'Fès & Meknès — 2 jours',
    'Les médinas impériales, les tanneries de Fès et les vestiges romains de Volubilis, avec un guide historien.',
    'Deux jours d''immersion dans le Maroc impérial : la médina de Fès classée à l''UNESCO, ses tanneries et son artisanat, puis Meknès et les ruines romaines de Volubilis, commentées par un guide historien passionné.',
    1290.00, 2, 10, 'easy',
    true, true,
    array ['Guide historien', 'Transport', '1 nuit riad en médina', 'Petit-déjeuner'],
    array ['Déjeuners et dîners', 'Entrées des monuments', 'Pourboires'],
    'Fès', 'Fès'
  ),
  (
    'chefchaouen-rif-1-jour',
    (select id from public.destinations where slug = 'chefchaouen'),
    'Chefchaouen & le Rif — 1 jour',
    'Journée dans la perle bleue du Rif : ruelles bleues, cascade d''Akchour et déjeuner chez l''habitant.',
    'Une journée depuis Tanger ou Fès : promenade dans les ruelles bleues, marché artisanal, puis randonnée facile jusqu''aux cascades d''Akchour. Déjeuner chez une famille berbère dans le village de Talassemtane.',
    690.00, 1, 8, 'easy',
    true, true,
    array ['Transport', 'Guide local', 'Déjeuner chez l''habitant', 'Entrée du parc national'],
    array ['Boissons', 'Pourboires'],
    'Tanger ou Fès', 'Tanger ou Fès'
  )
on conflict (slug) do nothing;

-- ── Itinerary: Sahara tour (3 days) ──────────────────────────────────
insert into public.tour_itinerary (tour_id, day_number, title_fr, description_fr)
select t.id, d.day_number, d.title, d.description
from public.tours t
join (values
  (1, 'Marrakech → Aït Ben Haddou → Dadès',
   'Départ de Marrakech, franchissement du Tizi n''Tichka (2 260 m), visite de la kasbah d''Aït Ben Haddou puis nuit dans la vallée du Dadès.'),
  (2, 'Dadès → Todra → Merzouga',
   'Gorges du Dadès et du Todra, route des mille kasbahs, arrivée à Merzouga : dromadaire au coucher du soleil et nuit en bivouac.'),
  (3, 'Merzouga → Ziz → Marrakech',
   'Lever du soleil sur l''erg Chebbi, retour par la vallée du Ziz et les gorges, arrivée à Marrakech en fin de journée.')
) as d(day_number, title, description) on true
where t.slug = 'sahara-merzouga-3-jours'
on conflict (tour_id, day_number) do nothing;

-- ── Itinerary: Fès & Meknès tour (2 days) ────────────────────────────
insert into public.tour_itinerary (tour_id, day_number, title_fr, description_fr)
select t.id, d.day_number, d.title, d.description
from public.tours t
join (values
  (1, 'Médina de Fès el-Bali',
   'Porte Bleue, médersa Bou Inania, tanneries Chouara et ateliers d''artisans. Nuit en riad au cœur de la médina.'),
  (2, 'Meknès & Volubilis',
   'Place El-Hedim, mausolée de Moulay Ismaïl, puis les ruines romaines de Volubilis avant le retour.')
) as d(day_number, title, description) on true
where t.slug = 'fes-meknes-2-jours'
on conflict (tour_id, day_number) do nothing;

-- ── Departures: Sahara tour (scheduled dates) ────────────────────────
-- (tour_departures has no unique key, so ON CONFLICT can never fire —
--  the NOT EXISTS guard, like the one used for testimonials/faqs,
--  keeps the seed safe to re-run.)
insert into public.tour_departures (tour_id, start_date, end_date, price_mad, max_participants)
select t.id, d.start_date, d.end_date, d.price, d.max_pax
from public.tours t
join (values
  (date '2027-03-15', date '2027-03-17', 1890.00, 12),
  (date '2027-04-12', date '2027-04-14', 1990.00, 12),
  (date '2027-05-10', date '2027-05-12', 1890.00, 12)
) as d(start_date, end_date, price, max_pax) on true
where t.slug = 'sahara-merzouga-3-jours'
  and not exists (select 1 from public.tour_departures)
on conflict do nothing;

-- ── Testimonials ─────────────────────────────────────────────────────
-- (No unique key on this table — the NOT EXISTS guard keeps the seed
--  safe to re-run.)
insert into public.testimonials (author_name, author_country, rating, quote_fr)
select v.author_name, v.author_country, v.rating, v.quote_fr
from (values
  ('Claire M.', 'France', 5,
   'Trois jours magiques dans le désert. Notre guide Youssef connaissait chaque dune par son nom.'),
  ('Marco & Elisa', 'Italie', 5,
   'Organisation impeccable et vraies rencontres humaines. La nuit en bivouac reste notre plus beau souvenir.'),
  ('Sophie D.', 'Belgique', 4,
   'Ponctualité, bonne humeur et circuits parfaitement adaptés à nos enfants.')
) as v(author_name, author_country, rating, quote_fr)
where not exists (select 1 from public.testimonials);

-- ── FAQs ──────────────────────────────────────────────────────────────
insert into public.faqs (question_fr, answer_fr, sort_order)
select v.question, v.answer, v.sort_order
from (values
  ('Comment réserver un circuit ?', 'Choisissez un circuit, remplissez le formulaire de réservation, et nous vous répondons sous 24 h avec le programme détaillé et les disponibilités.', 1),
  ('Quels moyens de paiement acceptez-vous ?', 'Virement bancaire, espèces à Marrakech, ou paiement en ligne par carte pour les acomptes (disponible prochainement).', 2),
  ('Puis-je annuler ma réservation ?', 'Annulation gratuite jusqu''à 15 jours avant le départ. Entre 15 et 7 jours, 30 % de frais. Moins de 7 jours, 50 % de frais.', 3),
  ('Dans quelles langues sont les guides ?', 'Français, anglais, espagnol et arabe. Précisez votre langue lors de la réservation.', 4)
) as v(question, answer, sort_order)
where not exists (select 1 from public.faqs);

-- ── Blog ──────────────────────────────────────────────────────────────
insert into public.blog_posts (slug, title_fr, excerpt_fr, content_fr, is_published, published_at) values
  ('valise-desert-maroc',
   'Que mettre dans sa valise pour le désert marocain ?',
   'Vêtements, chaussures, trousseau : la liste complète pour voyager léger et bien équipé dans le Sahara.',
   E'## Les essentiels\n\nLe désert, c''est 30 °C le jour et parfois 5 °C la nuit. Prévoyez des couches : un t-shirt respirant, une chemise longue manches contre le soleil, une veste coupe-vent.\n\n## Les chaussures\n\nDes chaussures de marche légères pour les dunes — les sandales se remplissent de sable dès le premier méandre. Une paire de chaussettes chaudes pour le soir.\n\n## Le petit trousseau\n\nCrème solaire SPF50, lunettes de soleil, chapeau à bords larges et une gourde d''au moins 1,5 L. Votre guide prévoit toujours de l''eau, mais mieux vaut être autonome.\n\n## Ce qu''il ne faut PAS emporter\n\nTrop de choses ! Un sac de 40 L suffit largement pour trois jours. Les valises restent au départ de l''hôtel à Merzouga.',
   true, now())
on conflict (slug) do nothing;

-- END FILE: supabase/seed.sql

