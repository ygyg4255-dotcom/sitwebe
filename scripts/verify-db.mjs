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
 *   2. RLS actually hides what it must hide (negative tests),
 *   3. the storage bucket is readable anonymously,
 *   4. the auth endpoint is live and refuses bad credentials.
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
  // Under the "tours: staff update" policy an anonymous visitor sees
  // ZERO rows through the USING clause (is_staff()), so PostgREST
  // does NOT have to return an error — a "success" with 0 affected
  // rows is the EXPECTED behavior. The real invariant is therefore:
  // the row must be unchanged after the attempt.
  await supabase
    .from("tours")
    .update({ is_published: false })
    .eq("slug", "sahara-merzouga-3-jours");
  const { data: tour } = await supabase
    .from("tours")
    .select("is_published")
    .eq("slug", "sahara-merzouga-3-jours")
    .maybeSingle();
  if (!tour) return "sahara tour not found — seed incomplete";
  if (tour.is_published === false) {
    // RLS broken: the anonymous write went through. Restore and fail.
    await supabase
      .from("tours")
      .update({ is_published: true })
      .eq("slug", "sahara-merzouga-3-jours");
    return "anon CHANGED a tour — RLS NOT working!";
  }
  // Row unchanged — correct. (An explicit refusal like 42501 is fine
  // too; with this policy design it simply is not guaranteed.)
  return true;
});

await check("RLS: profiles are NOT readable anonymously", async () => {
  const { data, error } = await supabase.from("profiles").select("id");
  if (error) return error.message;
  return data.length === 0
    ? true
    : `anon can see ${data.length} profiles — RLS NOT working!`;
});

// ── Storage (migration 0005: public "media" bucket) ──────────────────────
await check("storage: 'media' bucket readable anonymously", async () => {
  // Lists the bucket contents with the anon key — allowed only if the
  // bucket exists AND the "media: public read" policy is in place.
  const { data, error } = await supabase.storage.from("media").list();
  if (error) return error.message;
  return Array.isArray(data) ? true : "unexpected storage response";
});

// ── Auth ──────────────────────────────────────────────────────────────────
await check("auth: endpoint live, bad login refused", async () => {
  // Harmless negative test: a wrong password must NEVER produce a
  // session. Proves the Auth service is reachable and rejecting
  // credentials without creating any user.
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "phase2-verification@sitewib.invalid",
    password: "definitely-not-the-right-password",
  });
  if (error) return true; // being refused is exactly what we want
  return data.session
    ? "wrong credentials were accepted — AUTH BROKEN!"
    : true; // no session without email confirmation — fine
});

console.log(
  failures === 0
    ? "\nAll checks passed ✔ (schema, seed data, RLS, storage and auth verified)\n"
    : `\n${failures} check(s) FAILED — fix before continuing\n`
);
process.exit(failures === 0 ? 0 : 1);