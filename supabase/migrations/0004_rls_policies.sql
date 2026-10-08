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

create policy "profiles: read own profile, staff reads all"
  on public.profiles for select
  using (id = auth.uid() or public.is_staff());

create policy "profiles: insert own profile"
  on public.profiles for insert
  with check (id = auth.uid() or public.is_admin());

-- Users can edit their own row but NOT their own role; only admins
-- can change roles.
create policy "profiles: update own profile, only admins change roles"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check ((id = auth.uid() and role = old.role) or public.is_admin());

create policy "profiles: admin delete"
  on public.profiles for delete
  using (public.is_admin());

-- ── site_settings ────────────────────────────────────────────────────
alter table public.site_settings enable row level security;

create policy "settings: public read"
  on public.site_settings for select
  using (true);

create policy "settings: staff insert"
  on public.site_settings for insert
  with check (public.is_staff());

create policy "settings: staff update"
  on public.site_settings for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "settings: admin delete"
  on public.site_settings for delete
  using (public.is_admin());

-- ── destinations ─────────────────────────────────────────────────────
alter table public.destinations enable row level security;

create policy "destinations: public reads published, staff reads all"
  on public.destinations for select
  using (is_published or public.is_staff());

create policy "destinations: staff insert"
  on public.destinations for insert
  with check (public.is_staff());

create policy "destinations: staff update"
  on public.destinations for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "destinations: staff delete"
  on public.destinations for delete
  using (public.is_staff());

-- ── tours ─────────────────────────────────────────────────────────────
alter table public.tours enable row level security;

create policy "tours: public reads published, staff reads all"
  on public.tours for select
  using (is_published or public.is_staff());

create policy "tours: staff insert"
  on public.tours for insert
  with check (public.is_staff());

create policy "tours: staff update"
  on public.tours for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "tours: staff delete"
  on public.tours for delete
  using (public.is_staff());

-- ── tour_itinerary ────────────────────────────────────────────────────
-- No own publish flag: readable by the public only while the PARENT
-- tour is published.
alter table public.tour_itinerary enable row level security;

create policy "itinerary: public reads when parent tour published"
  on public.tour_itinerary for select
  using (
    public.is_staff()
    or exists (
      select 1 from public.tours t
      where t.id = tour_itinerary.tour_id and t.is_published
    )
  );

create policy "itinerary: staff insert"
  on public.tour_itinerary for insert
  with check (public.is_staff());

create policy "itinerary: staff update"
  on public.tour_itinerary for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "itinerary: staff delete"
  on public.tour_itinerary for delete
  using (public.is_staff());

-- ── tour_departures ───────────────────────────────────────────────────
alter table public.tour_departures enable row level security;

create policy "departures: public reads when parent tour published"
  on public.tour_departures for select
  using (
    public.is_staff()
    or exists (
      select 1 from public.tours t
      where t.id = tour_departures.tour_id and t.is_published
    )
  );

create policy "departures: staff insert"
  on public.tour_departures for insert
  with check (public.is_staff());

create policy "departures: staff update"
  on public.tour_departures for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "departures: staff delete"
  on public.tour_departures for delete
  using (public.is_staff());

-- ── bookings ──────────────────────────────────────────────────────────
-- The key asymmetry: ANYONE may insert (submit the booking form), but
-- ONLY staff can ever read them. Customer data never leaks to the
-- public.
alter table public.bookings enable row level security;

create policy "bookings: public can submit"
  on public.bookings for insert
  with check (true);

create policy "bookings: staff read"
  on public.bookings for select
  using (public.is_staff());

create policy "bookings: staff update status"
  on public.bookings for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "bookings: admin delete"
  on public.bookings for delete
  using (public.is_admin());

-- ── inquiries ─────────────────────────────────────────────────────────
alter table public.inquiries enable row level security;

create policy "inquiries: public can submit"
  on public.inquiries for insert
  with check (true);

create policy "inquiries: staff read"
  on public.inquiries for select
  using (public.is_staff());

create policy "inquiries: staff update"
  on public.inquiries for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "inquiries: admin delete"
  on public.inquiries for delete
  using (public.is_admin());

-- ── testimonials ──────────────────────────────────────────────────────
alter table public.testimonials enable row level security;

create policy "testimonials: public reads published, staff reads all"
  on public.testimonials for select
  using (is_published or public.is_staff());

create policy "testimonials: staff insert"
  on public.testimonials for insert
  with check (public.is_staff());

create policy "testimonials: staff update"
  on public.testimonials for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "testimonials: staff delete"
  on public.testimonials for delete
  using (public.is_staff());

-- ── blog_posts ────────────────────────────────────────────────────────
alter table public.blog_posts enable row level security;

create policy "blog: public reads published, staff reads all"
  on public.blog_posts for select
  using (
    (is_published and published_at is not null and published_at <= now())
    or public.is_staff()
  );

create policy "blog: staff insert"
  on public.blog_posts for insert
  with check (public.is_staff());

create policy "blog: staff update"
  on public.blog_posts for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "blog: staff delete"
  on public.blog_posts for delete
  using (public.is_staff());

-- ── faqs ──────────────────────────────────────────────────────────────
alter table public.faqs enable row level security;

create policy "faqs: public reads published, staff reads all"
  on public.faqs for select
  using (is_published or public.is_staff());

create policy "faqs: staff insert"
  on public.faqs for insert
  with check (public.is_staff());

create policy "faqs: staff update"
  on public.faqs for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "faqs: staff delete"
  on public.faqs for delete
  using (public.is_staff());