-- ═══════════════════════════════════════════════════════════════════
-- SiteWib — Migration 0002: Tour catalog
-- destinations, tours, tour_itinerary, tour_departures
-- Run AFTER 0001.
-- ═══════════════════════════════════════════════════════════════════

-- ── destinations ─────────────────────────────────────────────────────
-- Regions the agency covers (Marrakech, Sahara, Chefchaouen, …).
create table public.destinations (
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
create table public.tours (
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

create index tours_published_featured_idx on public.tours (is_published, is_featured);
create index tours_destination_idx on public.tours (destination_id);

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

create trigger tours_set_updated_at
  before update on public.tours
  for each row execute function public.set_updated_at();

-- ── tour_itinerary ───────────────────────────────────────────────────
-- Day-by-day program of a tour. Deleted with its tour (cascade).
create table public.tour_itinerary (
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
create table public.tour_departures (
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