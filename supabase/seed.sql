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