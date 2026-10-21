# SiteWib — White-label Travel Agency Website Template

A production-quality, white-label website template for small Moroccan
travel agencies. One reusable codebase — deployed once per client, branded
from a single configuration point.

**Demo agency:** *Atlas Voyages* (fictional) · **Default language:** French

## Tech stack

- **Next.js 16** (App Router, typed routes, ISR) + **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first design tokens)
- **Supabase** — PostgreSQL, Auth, Storage
- **Resend** — email notifications (planned — booking confirmation
  e-mails are still a TODO)

## Getting started

```bash
npm install
npm run dev        # development server → http://localhost:3000
```

Open http://localhost:3000 — you are redirected to `/fr` (the default
locale). Try the language switcher in the header (EN / AR are wired up;
AR switches the layout to right-to-left). Staff manage the content at
http://localhost:3000/admin — see [Admin area & smoke test](#admin-area--smoke-test-phase-4).

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (all locales pre-rendered) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | TypeScript check without emitting files |
| `npm run bundle` | Regenerate `supabase/setup_all.sql` from the migrations + seed (with consistency checks) |
| `npm run verify:db` | Verify the live database: seed data, RLS negative tests, storage bucket, auth endpoint |
| `npm run smoke:phase4` | Phase 4 smoke test against a **running** server: public forms, admin gate, RLS role rules (creates labeled test rows — see below) |

### Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values.
`NEXT_PUBLIC_SITE_URL` is always needed; the Supabase keys are
required for live data and the admin area (without them the public
site still builds and runs on fallback content). The Resend key is
reserved for booking notification e-mails (not implemented yet).

## Supabase setup (Phase 2)

The site builds and runs even **without** a Supabase project — every
query guards on the environment and falls back to defaults/empty lists.
To connect a real database:

1. **Create a project** at [supabase.com](https://supabase.com)
   (one project per client agency — the free tier is enough).
2. **Run the migrations** in order in the SQL Editor
   (`Dashboard → SQL Editor → New query → paste → Run`):
   1. `supabase/migrations/0001_profiles_and_settings.sql`
   2. `supabase/migrations/0002_catalog_tables.sql`
   3. `supabase/migrations/0003_engagement_tables.sql`
   4. `supabase/migrations/0004_rls_policies.sql`
   5. `supabase/migrations/0005_storage_bucket.sql`

   **Shortcut:** on a *fresh* project you can instead paste
   `supabase/setup_all.sql` ONCE — a generated bundle of all five
   migrations **plus** the seed below, in the correct order. The
   bundle is safe to re-run even if a previous attempt failed halfway
   (tables/indexes use IF NOT EXISTS, triggers and policies are
   dropped and recreated — metadata only, data is never touched).
   Regenerate it with `npm run bundle`; do not hand-edit it.
3. **Seed the demo content:** run `supabase/seed.sql` the same way
   (safe to re-run — every insert is idempotent).
4. **Expose the tables to the Data API.** If the project was created
   with *"Automatically expose new tables"* **disabled** (recommended
   for security), the 11 new tables are not reachable through the API
   yet. Go to `Project Settings → Data API → Manage exposed tables`
   and expose: `profiles`, `site_settings`, `destinations`, `tours`,
   `tour_itinerary`, `tour_departures`, `bookings`, `inquiries`,
   `testimonials`, `blog_posts`, `faqs`. (RLS protects them all —
   exposure only *allows* the API to apply RLS-filtered queries.)
   Alternatively, enable *"Automatically expose new tables"* **before**
   step 2 and skip this step.
5. **Copy the keys** from `Project Settings → API` into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public key
6. **Create the first admin user:**
   `Authentication → Users → Add user` (email + password), then run
   this once in the SQL Editor with the user's UUID
   (shown on the user's row):
   ```sql
   update public.profiles set role = 'admin' where id = '<user-uuid>';
   ```
   New users get the `editor` role by default — least privilege.
7. **Verify everything:** `npm run verify:db` — it connects with the
   anonymous key (like a public visitor) and proves the seed data is
   readable, RLS hides drafts, bookings and profiles, the storage
   bucket is public-readable and the auth endpoint refuses bad
   credentials.

### Security model (RLS)

- Public visitors can **read** published content and **insert**
  bookings/inquiries — nothing else.
- Staff (`admin`/`editor` roles in `profiles`) can manage content.
- Only `admin` can change roles and delete bookings.
- Rules live in the database (migration `0004`), so the data is safe
  even if the application code were ever buggy.

## Project structure

```
app/
  [locale]/            # All routes are locale-prefixed: /fr, /en, /ar
    layout.tsx         # ROOT layout: fonts, lang/dir, branding CSS vars
    page.tsx           # Homepage (live DB sections + JSON-LD)
    not-found.tsx      # 404 inside a locale
    loading.tsx        # Skeleton shown while a page streams
    error.tsx          # Error boundary (client, retry button)
    tours/page.tsx           # Catalog of all published tours
    tours/[slug]/page.tsx    # Tour detail: itinerary, departures, …
    destinations/page.tsx    # All destinations
    destinations/[slug]/page.tsx  # Destination + its tours
    about/ contact/          # Agency story / contact details
    blog/page.tsx            # Blog index
    blog/[slug]/page.tsx     # Article (safe Markdown rendering)
    gallery/ testimonials/ faq/   # Photo grid / reviews / accordions
  admin/               # Staff area — French-only, no locale prefix
    login/page.tsx     # Sign-in form
    (protected)/       # Session+role-gated: dashboard, settings, and
                       # CRUD pages for tours, destinations, blog,
                       # testimonials, FAQs, bookings, inquiries
  sitemap.ts           # Per-URL language alternates, DB-driven slugs
  robots.ts            # robots.txt (allows public, disallows /admin, points to the sitemap)
proxy.ts               # Locale routing + admin cookie gate (Next 16 proxy convention)
components/
  layout/             # Navbar, Footer, LocaleSwitcher
  ui/                 # Design system: Button, Card, Badge, Input, …
  home/               # Homepage sections (Hero, Tours, Testimonials, …)
  tours/ destinations/ testimonials/ blog/  # Content cards
  forms/              # Public booking + inquiry forms (server actions)
  admin/              # Admin shell, controls, and entity forms
  seo/JsonLd.tsx      # Escaped <script type="application/ld+json">
  blog/Markdown.tsx   # Whitelist Markdown → React (no raw HTML)
lib/
  config/site.ts      # ★ WHITE-LABEL BRANDING CONTRACT (read this first)
  i18n/               # Locale config + message dictionaries (fr/en/ar)
    content.ts        # localizedText(): DB text with French fallback
  types/database.ts   # ★ Typed schema for all 11 tables
  supabase/           # Server / browser / anonymous clients (env-guarded)
  queries/            # Cached read functions ("use cache" + cacheTag)
    admin.ts          # Admin-area reads (staff-gated)
  actions/            # Server Actions (Zod-validated mutations) —
                       # public (bookings, inquiries) + admin (tours,
                       # destinations, blog, testimonials, FAQs,
                       # departures, itinerary, media, settings, auth)
  form.ts             # Server-action form helpers (formData parsing,
                       # error-result shaping for the forms)
  auth.ts             # getCurrentProfile / requireStaff / requireAdmin
  validation.ts       # Zod schemas (French error messages)
  seo.ts              # Alternates/canonicals + JSON-LD builders
  format.ts           # Per-locale Intl price & date formatting
supabase/
  migrations/          # 0001–0005 (run in order, then seed.sql)
  setup_all.sql        # generated one-paste bundle: all migrations + seed
  seed.sql            # Atlas Voyages demo data (idempotent)
scripts/
  verify-db.mjs        # Database + RLS verification (npm run verify:db)
  smoke-phase4.mjs     # Phase 4 smoke test (npm run smoke:phase4)
app/globals.css       # Design tokens (Terracotta/Sahara palette)
```

## White-label branding — how re-theming works

All client-specific branding lives in **one place**: `lib/config/site.ts`.

```
getBranding() → brandingToCssVars() → CSS variables on <html>
             → Tailwind utilities (bg-primary, text-accent, …)
```

- `getBranding()` reads the `site_settings` table first; when the
  database is unreachable or not yet configured, it falls back to
  `defaultBranding` — the site never breaks.
- Agencies edit these values from the admin dashboard
  (`/admin/settings` → `updateSiteSettings` server action) with zero
  code changes.

## i18n (French-first, EN/AR-ready)

- Locales are defined in `lib/i18n/config.ts`; French is default.
- UI labels live in `lib/i18n/messages/{fr,en,ar}.ts`. The `Dictionary`
  type is derived from the French file — a missing key in another locale
  is a compile error.
- Arabic already renders right-to-left (`dir="rtl"`); layouts use
  logical CSS utilities (`ms-*`, `start-*`) so RTL mirrors correctly.
  Arabic pages load the **Cairo** web font (next/font) for both display
  and body text — French/English pages use Marcellus + Inter.
- Database content has French (required) + optional EN/AR columns;
  `localizedText()` picks the locale's text and falls back to French
  when a translation is missing (real Arabic *content* in the database
  is still a TODO). The Arabic UI dictionary (`lib/i18n/messages/ar.ts`)
  is fully translated in Modern Standard Arabic.

## Admin area & smoke test (Phase 4)

The staff area lives at **`/admin`** (French-only paths, no locale
prefix). Anonymous visitors are redirected to `/admin/login` by the
proxy before rendering; the `(protected)` layout then verifies the real
session and role, and RLS remains the data boundary. `robots.ts`
disallows `/admin` so the dashboard never lands in search indexes.

`npm run smoke:phase4` verifies the whole flow against a **running**
server (`npm run start` or `npm run dev`) and the same `.env.local`:

1. public routes answer 200 and the booking/inquiry forms render,
2. `/admin` redirects anonymous visitors to `/admin/login`,
3. anonymous REST inserts persist a booking + inquiry but stay
   unreadable anonymously (RLS),
4. the staff account from `SMOKE_TEST_EMAIL`/`SMOKE_TEST_PASSWORD`
   reads staff data; an EDITER is refused the admin-only deletes while
   an ADMIN is allowed,
5. with the session cookie, the admin pages render for that staff member.

The script never prints secrets — the test account's password is
generated in memory. **Side effects:** one booking row and one inquiry
row named *"Smoke Test Phase 4"* are created and labeled; they are
deleted automatically when the test runs with an ADMIN account, and
can otherwise be removed from `/admin/bookings` and `/admin/inquiries`,
or with SQL:

```sql
delete from public.bookings  where full_name = 'Smoke Test Phase 4';
delete from public.inquiries where name      = 'Smoke Test Phase 4';
```

## Roadmap status

| Phase | Scope | Status |
|---|---|---|
| 1 | Setup, design system, i18n-ready layout, homepage shell | ✅ Done |
| 2 | Supabase database, auth, RLS, server actions | ✅ Done |
| 3 | Public website (tours, destinations, blog, gallery, …) | ✅ Done |
| 4 | Booking system + admin dashboard | ✅ Done — end-to-end verification against a live seeded Supabase project (`npm run verify:db`, `npm run smoke:phase4`) is the remaining pre-deployment step |
| 5 | Booking e-mail notifications (Resend), security review, deployment, client-setup docs | ⏳ |