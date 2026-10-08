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
create table public.profiles (
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── site_settings ────────────────────────────────────────────────────
-- The white-label source of truth: ALL client branding, colors,
-- contact and social data live in this single row. The check on `id`
-- guarantees the table can never contain more than one row.
create table public.site_settings (
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