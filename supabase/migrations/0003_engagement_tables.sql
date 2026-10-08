-- ═══════════════════════════════════════════════════════════════════
-- SiteWib — Migration 0003: Engagement tables
-- bookings, inquiries, testimonials, blog_posts, faqs
-- Run AFTER 0002.
-- ═══════════════════════════════════════════════════════════════════

-- ── bookings ─────────────────────────────────────────────────────────
-- Customer booking requests (inquiries, NOT payments — Phase 4+ may
-- add payments). Insertable by anyone (the booking form), readable and
-- manageable only by staff (enforced by RLS in migration 0004).
create table public.bookings (
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

create index bookings_status_created_idx on public.bookings (status, created_at);

-- ── inquiries ─────────────────────────────────────────────────────────
-- Simple contact form messages (not tied to a tour).
create table public.inquiries (
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
create table public.testimonials (
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
create table public.blog_posts (
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

create index blog_posts_published_idx on public.blog_posts (is_published, published_at);

-- ── faqs ──────────────────────────────────────────────────────────────
create table public.faqs (
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