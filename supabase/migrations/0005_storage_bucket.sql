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

create policy "media: public read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media: staff upload"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_staff());

create policy "media: staff update"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_staff())
  with check (bucket_id = 'media' and public.is_staff());

create policy "media: staff delete"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_staff());