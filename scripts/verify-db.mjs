/**
 * Database verification script (Phase 2+).
 *
 * Run after creating your Supabase project, running the migrations and
 * the seed:
 *
 *   npm run verify:db
 *
 * It connects with the ANONYMOUS key (exactly like the public site
 * does) and checks:
 *   1. every public read returns the seeded data,
 *   2. RLS actually hides what it must hide (negative tests).
 *
 * Exits non-zero if anything fails.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "✗ Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
  process.exit(1);
}

// Anonymous client = exactly what an anonymous visitor can see.
const supabase = createClient(url, anonKey);

let failures = 0;

async function check(name, fn) {
  try {
    const result = await fn();
    if (result === true) {
      console.log(`✓ ${name}`);
    } else {
      console.error(`✗ ${name} → ${result}`);
      failures += 1;
    }
  } catch (error) {
    console.error(`✗ ${name} → threw: ${error.message}`);
    failures += 1;
  }
}

console.log(`\nSiteWib database verification (${url})\n`);

// ── Public reads ────────────────────────────────────────────────────────
await check("site_settings: single row readable", async () => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("agency_name, tagline")
    .eq("id", 1)
    .maybeSingle();
  if (error) return error.message;
  return data && data.agency_name ? true : "no settings row found";
});

await check("destinations: seed readable (published only)", async () => {
  const { data, error } = await supabase
    .from("destinations")
    .select("slug")
    .eq("is_published", true);
  if (error) return error.message;
  return data.length >= 6
    ? true
    : `expected ≥6 destinations, got ${data.length} — did you run seed.sql?`;
});

await check("tours: 3 published seeded tours", async () => {
  const { data, error } = await supabase
    .from("tours")
    .select("slug, price_mad, duration_days")
    .eq("is_published", true);
  if (error) return error.message;
  return data.length >= 3
    ? true
    : `expected ≥3 published tours, got ${data.length} — did you run seed.sql?`;
});

await check("tour_itinerary: readable for a published tour", async () => {
  const { data: tours } = await supabase
    .from("tours")
    .select("id")
    .eq("slug", "sahara-merzouga-3-jours")
    .maybeSingle();
  if (!tours) return "sahara tour not found";
  const { data, error } = await supabase
    .from("tour_itinerary")
    .select("day_number, title_fr")
    .eq("tour_id", tours.id)
    .order("day_number");
  if (error) return error.message;
  return data.length === 3
    ? true
    : `expected 3 itinerary days, got ${data.length}`;
});

await check("tour_departures: 3 scheduled dates", async () => {
  const { data: tours } = await supabase
    .from("tours")
    .select("id")
    .eq("slug", "sahara-merzouga-3-jours")
    .maybeSingle();
  if (!tours) return "sahara tour not found";
  const { data, error } = await supabase
    .from("tour_departures")
    .select("start_date")
    .eq("tour_id", tours.id);
  if (error) return error.message;
  return data.length === 3
    ? true
    : `expected 3 departures, got ${data.length}`;
});

await check("testimonials: seed readable", async () => {
  const { data, error } = await supabase
    .from("testimonials")
    .select("author_name, rating")
    .eq("is_published", true);
  if (error) return error.message;
  return data.length >= 3 ? true : `expected ≥3, got ${data.length}`;
});

await check("faqs: seed readable", async () => {
  const { data, error } = await supabase
    .from("faqs")
    .select("question_fr")
    .eq("is_published", true);
  if (error) return error.message;
  return data.length >= 4 ? true : `expected ≥4, got ${data.length}`;
});

await check("blog_posts: seed article readable", async () => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true)
    .eq("slug", "valise-desert-maroc")
    .maybeSingle();
  if (error) return error.message;
  return data ? true : "seed article not found";
});

// ── RLS negative tests (the security-critical ones) ─────────────────────
await check("RLS: unpublished tours are NOT visible anonymously", async () => {
  const { data, error } = await supabase
    .from("tours")
    .select("id")
    .eq("is_published", false);
  if (error) return error.message;
  return data.length === 0
    ? true
    : `anon can see ${data.length} draft tours — RLS NOT working!`;
});

await check("RLS: bookings are NOT readable anonymously", async () => {
  const { data, error } = await supabase.from("bookings").select("id");
  if (error) return error.message;
  return data.length === 0
    ? true
    : `anon can see ${data.length} bookings — RLS NOT working!`;
});

await check("RLS: staff data is NOT writable anonymously", async () => {
  const { error } = await supabase
    .from("tours")
    .update({ is_published: false })
    .eq("slug", "sahara-merzouga-3-jours");
  return error === null
    ? "anon UPDATED a tour — RLS NOT working!"
    : true; // being refused is exactly what we want
});

await check("RLS: profiles are NOT readable anonymously", async () => {
  const { data, error } = await supabase.from("profiles").select("id");
  if (error) return error.message;
  return data.length === 0
    ? true
    : `anon can see ${data.length} profiles — RLS NOT working!`;
});

console.log(
  failures === 0
    ? "\nAll checks passed ✔ (database schema, seed data and RLS verified)\n"
    : `\n${failures} check(s) FAILED — fix before continuing\n`
);
process.exit(failures === 0 ? 0 : 1);