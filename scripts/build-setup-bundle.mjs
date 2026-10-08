/**
 * Regenerates `supabase/setup_all.sql` — the one-paste bundle of all
 * database migrations plus the seed, in the correct order.
 *
 *   node scripts/build-setup-bundle.mjs    (or: npm run bundle)
 *
 * After writing the file, the script VERIFIES the result against the
 * sources and exits non-zero if anything is off, so a broken bundle
 * never gets past this step:
 *   1. every source file's exact content is embedded, in order,
 *   2. key statement counts match the current migrations,
 *   3. no non-idempotent DDL and no `old.` references slip in
 *      (RLS policies cannot use the OLD row record — PostgreSQL
 *      error 42P01),
 *   4. the fixed "own profile" policy and seed guards are present.
 *
 * If you intentionally change a migration, re-run this script and
 * update the EXPECTED counts below to match the new state.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCES = [
  "supabase/migrations/0001_profiles_and_settings.sql",
  "supabase/migrations/0002_catalog_tables.sql",
  "supabase/migrations/0003_engagement_tables.sql",
  "supabase/migrations/0004_rls_policies.sql",
  "supabase/migrations/0005_storage_bucket.sql",
  "supabase/seed.sql",
];

/** Statement counts the bundle must contain (update with migrations). */
const EXPECTED = {
  tables: 11, // create table if not exists
  indexes: 4, // create index if not exists
  functions: 4, // create or replace function
  triggers: 2, // create trigger
  droppedTriggers: 2, // drop trigger if exists (one per create)
  policies: 48, // create policy (44 in 0004 + 4 in 0005)
  droppedPolicies: 48, // drop policy if exists (one per create)
  rlsTables: 11, // enable row level security
  keyedInserts: 8, // on conflict do nothing (7 in seed + bucket in 0005)
  seedGuards: 3, // not exists guards (testimonials, faqs, departures)
};

const HEADER = `-- ═══════════════════════════════════════════════════════════════════
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

`;

const beginMarker = (name) =>
  "-- ═══════════════════════════════════════════════════════════════════\n" +
  `-- BEGIN FILE: ${name}\n` +
  "-- ═══════════════════════════════════════════════════════════════════\n\n";

// ── Read the sources ───────────────────────────────────────────────
const contents = SOURCES.map((rel) => ({
  rel,
  text: readFileSync(resolve(root, rel), "utf8"),
}));

// ── Write the bundle ───────────────────────────────────────────────
const bundle =
  HEADER +
  contents
    .map(
      ({ rel, text }) =>
        beginMarker(rel) + text + `\n\n-- END FILE: ${rel}\n\n`
    )
    .join("");

writeFileSync(resolve(root, "supabase/setup_all.sql"), bundle, "utf8");
console.log(`\nRegenerated supabase/setup_all.sql (${bundle.length} bytes)\n`);

// ── Verification ───────────────────────────────────────────────────
const failures = [];
const expect = (name, actual, wanted) => {
  if (actual === wanted) {
    console.log(`✓ ${name}: ${actual}`);
  } else {
    failures.push(`${name}: expected ${wanted}, found ${actual}`);
    console.error(`✗ ${name}: expected ${wanted}, found ${actual}`);
  }
};

// 1. Every source embedded intact, and in order.
console.log("Verifying bundle against sources:\n");
let cursor = 0;
for (const { rel, text } of contents) {
  const at = bundle.indexOf(text, cursor);
  if (at === -1) {
    failures.push(`source not embedded intact: ${rel}`);
    console.error(`✗ embedded intact + in order: ${rel}`);
  } else {
    cursor = at + text.length;
    console.log(`✓ embedded intact + in order: ${rel}`);
  }
}

// 2. Key statement counts.
const count = (re) => (bundle.match(re) || []).length;
expect("tables (create table if not exists)", count(/create table if not exists public\./g), EXPECTED.tables);
expect("indexes (create index if not exists)", count(/create index if not exists /g), EXPECTED.indexes);
expect("functions (create or replace function)", count(/create or replace function/g), EXPECTED.functions);
expect("triggers (create trigger)", count(/create trigger/g), EXPECTED.triggers);
expect("dropped triggers (drop trigger if exists)", count(/drop trigger if exists/g), EXPECTED.droppedTriggers);
expect("policies (create policy)", count(/create policy/g), EXPECTED.policies);
expect("dropped policies (drop policy if exists)", count(/drop policy if exists/g), EXPECTED.droppedPolicies);
expect("RLS-enabled tables (enable row level security)", count(/enable row level security/g), EXPECTED.rlsTables);
expect("keyed inserts (on conflict do nothing)", count(/on conflict( \(.*\))? do nothing/g), EXPECTED.keyedInserts);
expect("seed not-exists guards", count(/not exists \(select 1 from public\./g), EXPECTED.seedGuards);

// 3. No non-idempotent DDL, no `old.` references (42P01 bug guard).
const plainTables = count(/create table (?!if not exists)/g);
const plainIndexes = count(/create index (?!if not exists)/g);
const oldRefs = count(/old\./g);
expect("non-idempotent create table (must be 0)", plainTables, 0);
expect("non-idempotent create index (must be 0)", plainIndexes, 0);
expect("`old.` references in SQL (must be 0 — 42P01)", oldRefs, 0);
if (bundle.includes("role = old.role")) {
  failures.push("the broken 42P01 expression is still present");
  console.error("✗ the broken 42P01 expression is still present");
}

// 4. The fixed policy and the seed departures guard are present.
const fixedPolicy = "select p.role from public.profiles p where p.id = auth.uid()";
if (bundle.includes(fixedPolicy)) {
  console.log("✓ fixed own-profile update policy (role fetched via subquery)");
} else {
  failures.push("fixed own-profile update policy not found");
  console.error("✗ fixed own-profile update policy not found");
}
const departuresGuard = "and not exists (select 1 from public.tour_departures)";
if (bundle.includes(departuresGuard)) {
  console.log("✓ seed departures NOT EXISTS guard present (re-run safe)");
} else {
  failures.push("seed departures guard not found");
  console.error("✗ seed departures guard not found");
}

console.log(
  failures.length === 0
    ? "\nAll bundle checks passed ✔ (bundle matches the migrations + seed)\n"
    : `\n${failures.length} bundle check(s) FAILED\n`
);
process.exit(failures.length === 0 ? 0 : 1);