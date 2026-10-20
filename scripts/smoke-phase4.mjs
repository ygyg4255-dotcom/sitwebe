/**
 * Phase 4 smoke tests — booking/inquiry flow + admin auth + role rules.
 *
 *   npm run smoke:phase4
 *
 * Requires a RUNNING server (npm run start or npm run dev) and the
 * same .env.local as the app. Never prints secrets: the test account's
 * password is generated in memory and only its e-mail is shown.
 *
 * Checks:
 *   1. public routes answer 200 and the booking/inquiry forms render,
 *   2. /admin redirects anonymous visitors to /admin/login,
 *   3. anonymous REST inserts persist a booking + inquiry but stay
 *      unreadable anonymously (RLS),
 *   4. the staff account from SMOKE_TEST_EMAIL/SMOKE_TEST_PASSWORD
 *      reads staff data; an EDITER is refused the admin-only deletes
 *      while an ADMIN is allowed (RLS role rules, verified either way),
 *   5. with the session cookie, the admin pages render for that staff
 *      member.
 *
 * Side effects (labeled, easy to remove): one booking row and one
 * inquiry row named "Smoke Test Phase 4" — deleted automatically when
 * the test runs with an ADMIN account. See the Phase 4 report / README
 * for cleanup steps.
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

if (!url || !anonKey) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

// Anonymous client — exactly what a public visitor can do.
const supabase = createClient(url, anonKey);

// Auth for the editor/role-rule tests. Two ways to provide it:
//   1. SMOKE_TEST_EMAIL + SMOKE_TEST_PASSWORD in .env.local — a staff
//      account created from the Supabase dashboard (Authentication →
//      Users → Add user; dashboard users are auto-confirmed). This is
//      the reliable path: this project requires e-mail confirmation,
//      and self-signup is additionally subject to Supabase's e-mail
//      domain filters.
//   2. Without env credentials the script tries a self-signup (only
//      works when e-mail confirmation is disabled on the project) and
//      otherwise SKIPS the authenticated tests with instructions.
const TEST_EMAIL = process.env.SMOKE_TEST_EMAIL ?? "sitewib-smoke-test@example.com";
const TEST_PASSWORD =
  process.env.SMOKE_TEST_PASSWORD ?? randomUUID() + "Aa1!"; // never printed
const BOOKING_NAME = "Smoke Test Phase 4";
const INQUIRY_NAME = "Smoke Test Phase 4";

let failures = 0;
let skipped = 0;

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

function skipCheck(name, reason) {
  console.log(`⚠ SKIPPED ${name} → ${reason}`);
  skipped += 1;
}

// ── HTTP helpers ─────────────────────────────────────────────────────────

async function httpStatus(path, options = {}) {
  const response = await fetch(`${siteUrl}${path}`, { redirect: "manual", ...options });
  return response;
}

async function bodyOf(path) {
  const response = await fetch(`${siteUrl}${path}`);
  return response.status === 200 ? await response.text() : null;
}

/**
 * Builds the @supabase/ssr auth cookie header value(s) for a session —
 * same format the app's server client writes: "base64-" + base64url of
 * the JSON session, chunked (name.0, name.1, …) when the encoded value
 * exceeds the 3180-char chunk limit (see @supabase/ssr chunker.js).
 */
function authCookieHeader(session) {
  const ref = new URL(url).hostname.split(".")[0];
  const name = `sb-${ref}-auth-token`;
  const value = `base64-${Buffer.from(JSON.stringify(session), "utf8").toString("base64url")}`;
  const encoded = encodeURIComponent(value);
  if (encoded.length <= 3180) {
    return `${name}=${encoded}`;
  }
  const parts = [];
  let rest = encoded;
  let index = 0;
  while (rest.length > 0) {
    let head = rest.slice(0, 3180);
    const lastPercent = head.lastIndexOf("%");
    if (lastPercent > 3180 - 3) head = head.slice(0, lastPercent);
    let chunk;
    for (;;) {
      try {
        chunk = decodeURIComponent(head);
        break;
      } catch {
        head = head.slice(0, head.length - 3);
      }
    }
    parts.push(`${name}.${index}=${encodeURIComponent(chunk)}`);
    rest = rest.slice(head.length);
    index += 1;
  }
  return parts.join("; ");
}

console.log(`\nSiteWib Phase 4 smoke tests (${siteUrl})\n`);

// ── 1. Public routes + wired forms ───────────────────────────────────────

await check("public: /fr answers 200", async () => {
  const response = await httpStatus("/fr");
  return response.status === 200 ? true : `status ${response.status}`;
});

await check("public: /fr/tours answers 200", async () => {
  const response = await httpStatus("/fr/tours");
  return response.status === 200 ? true : `status ${response.status}`;
});

await check("public: /fr/contact answers 200", async () => {
  const response = await httpStatus("/fr/contact");
  return response.status === 200 ? true : `status ${response.status}`;
});

await check("contact page renders the inquiry form", async () => {
  const html = await bodyOf("/fr/contact");
  return html && html.includes('name="message"') && html.includes('name="email"')
    ? true
    : "inquiry form fields not found in the HTML";
});

let publishedTour = null;
await check("anon REST: a published tour exists", async () => {
  const { data, error } = await supabase
    .from("tours")
    .select("id, slug")
    .eq("is_published", true)
    .limit(1)
    .maybeSingle();
  if (error) return error.message;
  if (!data) return "no published tour — did you run the seed?";
  publishedTour = data;
  return true;
});

await check("tour detail renders the booking form (id=\"book\")", async () => {
  if (!publishedTour) return "no tour to test with";
  const html = await bodyOf(`/fr/tours/${publishedTour.slug}`);
  return html && html.includes('id="book"') && html.includes('name="fullName"')
    ? true
    : "booking form not found on the tour page";
});

// ── 2. Admin guard (unauthorized visitors) ──────────────────────────────

await check("admin guard: /admin redirects to /admin/login", async () => {
  const response = await httpStatus("/admin");
  const location = response.headers.get("location") ?? "";
  return response.status >= 300 && response.status < 400 && location.includes("/admin/login")
    ? true
    : `status ${response.status}, location ${location || "(none)"}`;
});

await check("admin guard: /admin/bookings redirects anonymous users", async () => {
  const response = await httpStatus("/admin/bookings");
  const location = response.headers.get("location") ?? "";
  return response.status >= 300 && response.status < 400 && location.includes("/admin/login")
    ? true
    : `status ${response.status}, location ${location || "(none)"}`;
});

await check("/admin/login answers 200", async () => {
  const response = await httpStatus("/admin/login");
  return response.status === 200 ? true : `status ${response.status}`;
});

// ── 3. Booking/inquiry persistence + RLS hiding (anonymous) ──────────────

await check("anon REST: booking insert succeeds", async () => {
  if (!publishedTour) return "no tour to test with";
  const { error } = await supabase.from("bookings").insert({
    tour_id: publishedTour.id,
    full_name: BOOKING_NAME,
    email: "smoke@sitewib.test",
    num_adults: 2,
    num_children: 0,
    message: "Smoke test — réservation créée par scripts/smoke-phase4.mjs.",
  });
  return error ? error.message : true;
});

await check("anon REST: booking stays unreadable anonymously (RLS)", async () => {
  const { data, error } = await supabase.from("bookings").select("id");
  if (error) return error.message;
  return data.length === 0 ? true : `anonymous SELECT returned ${data.length} row(s)`;
});

await check("anon REST: inquiry insert succeeds", async () => {
  const { error } = await supabase.from("inquiries").insert({
    name: INQUIRY_NAME,
    email: "smoke@sitewib.test",
    subject: "Smoke test",
    message: "Smoke test — message créé par scripts/smoke-phase4.mjs.",
  });
  return error ? error.message : true;
});

await check("anon REST: inquiry stays unreadable anonymously (RLS)", async () => {
  const { data, error } = await supabase.from("inquiries").select("id");
  if (error) return error.message;
  return data.length === 0 ? true : `anonymous SELECT returned ${data.length} row(s)`;
});

// ── 4. Test editor: signup + role rules ────────────────────────────────

let session = null;
let editorClient = null;
let adminCleanupDone = false; // smoke rows deleted by an admin run

await check("auth: test editor can sign in or sign up", async () => {
  // Prefer the configured staff credentials (dashboard-created account).
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (!signInError && signInData.session) {
    session = signInData.session;
    return true;
  }
  if (process.env.SMOKE_TEST_EMAIL && process.env.SMOKE_TEST_PASSWORD) {
    return `sign-in with SMOKE_TEST_EMAIL failed: ${signInError?.message ?? "no session"} — check the credentials and that the user is confirmed (dashboard-created users are)`;
  }

  // Fallback: self-signup — only works when e-mail confirmation is off.
  const { data, error } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (error) {
    return `signUp refused: ${error.message}`;
  }
  if (data.session) {
    session = data.session;
    return true;
  }
  return "no session returned — e-mail confirmation is enabled on this project";
});

if (session) {
  editorClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${session.access_token}` } },
  });

  let profileRole = null;
  await check("auth: session grants the profile row", async () => {
    const { data, error } = await editorClient
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();
    if (error) return error.message;
    if (!data?.role) return "no profile row found";
    if (data.role !== "admin" && data.role !== "editor") {
      return `role "${data.role}" is not a staff role — set it to 'admin' or 'editor' (README step 6)`;
    }
    profileRole = data.role;
    return `role = ${data.role}`;
  });

  if (profileRole) {
    // The role-rule checks are symmetric: an EDITOR must be refused the
    // admin-only deletes, an ADMIN must be allowed (and then cleans the
    // smoke rows up). Either way the RLS boundary is verified.
    const expectRefused = profileRole === "editor";

    await check(`staff(${profileRole}): can read bookings (staff read allowed)`, async () => {
      const { data, error } = await editorClient.from("bookings").select("id, full_name");
      if (error) return error.message;
      return data.some((row) => row.full_name === BOOKING_NAME)
        ? true
        : `staff SELECT visible but the smoke booking is missing (${data.length} row(s))`;
    });

    await check(`staff(${profileRole}): can read inquiries (staff read allowed)`, async () => {
      const { data, error } = await editorClient.from("inquiries").select("id, name");
      if (error) return error.message;
      return data.some((row) => row.name === INQUIRY_NAME)
        ? true
        : `staff SELECT visible but the smoke inquiry is missing (${data.length} row(s))`;
    });

    await check(
      `role rules: booking delete ${expectRefused ? "REFUSED for editor" : "ALLOWED for admin"} (RLS)`,
      async () => {
        const { data } = await editorClient
          .from("bookings")
          .select("id")
          .eq("full_name", BOOKING_NAME)
          .limit(1)
          .maybeSingle();
        if (!data) return "smoke booking not found";
        const { error } = await editorClient.from("bookings").delete().eq("id", data.id);
        if (expectRefused) {
          return error
            ? true
            : "delete unexpectedly SUCCEEDED — RLS is not enforcing admin-only!";
        }
        if (error) return `delete refused: ${error.message}`;
        adminCleanupDone = true;
        return true;
      }
    );

    await check(
      `role rules: inquiry delete ${expectRefused ? "REFUSED for editor" : "ALLOWED for admin"} (RLS)`,
      async () => {
        const { data } = await editorClient
          .from("inquiries")
          .select("id")
          .eq("name", INQUIRY_NAME)
          .limit(1)
          .maybeSingle();
        if (!data) return "smoke inquiry not found";
        const { error } = await editorClient.from("inquiries").delete().eq("id", data.id);
        if (expectRefused) {
          return error
            ? true
            : "delete unexpectedly SUCCEEDED — RLS is not enforcing admin-only!";
        }
        if (error) return `delete refused: ${error.message}`;
        adminCleanupDone = true;
        return true;
      }
    );

    await check(`staff(${profileRole}): content CRUD works (faq insert + delete)`, async () => {
      const { data: inserted, error: insertError } = await editorClient
        .from("faqs")
        .insert({
          question_fr: "Smoke test — à supprimer",
          answer_fr: "Smoke test — à supprimer",
          sort_order: 999,
          is_published: false,
        })
        .select("id")
        .single();
      if (insertError) return `insert: ${insertError.message}`;
      const { error: deleteError } = await editorClient
        .from("faqs")
        .delete()
        .eq("id", inserted.id);
      return deleteError ? `delete: ${deleteError.message}` : true;
    });

    // ── 5. Admin pages render for the authenticated staff member ───────

    const cookie = authCookieHeader(session);

    await check(`admin HTTP: dashboard renders for the ${profileRole}`, async () => {
      const response = await fetch(`${siteUrl}/admin`, {
        headers: { Cookie: cookie },
        redirect: "manual",
      });
      if (response.status !== 200) return `status ${response.status}`;
      const html = await response.text();
      return html.includes("Tableau de bord") ? true : "dashboard content missing";
    });

    await check(`admin HTTP: bookings page renders for the ${profileRole}`, async () => {
      const response = await fetch(`${siteUrl}/admin/bookings`, {
        headers: { Cookie: cookie },
        redirect: "manual",
      });
      if (response.status !== 200) return `status ${response.status}`;
      const html = await response.text();
      return html.includes("Réservations") && html.includes(BOOKING_NAME)
        ? true
        : "bookings list or smoke booking missing from the page";
    });

    await check(`admin HTTP: tours page renders for the ${profileRole}`, async () => {
      const response = await fetch(`${siteUrl}/admin/tours`, {
        headers: { Cookie: cookie },
        redirect: "manual",
      });
      if (response.status !== 200) return `status ${response.status}`;
      const html = await response.text();
      return html.includes("Circuits") ? true : "tours list missing from the page";
    });
  }
} else {
  skipCheck(
    "authenticated editor tests",
    "no staff session — create a test staff account from the Supabase dashboard (Authentication → Users → Add user, e.g. test@youragency), then add SMOKE_TEST_EMAIL and SMOKE_TEST_PASSWORD to .env.local and re-run."
  );
}

// ── Summary ──────────────────────────────────────────────────────────────

console.log("");
if (failures > 0) {
  console.error(`✗ ${failures} check(s) failed${skipped ? `, ${skipped} skipped` : ""}.`);
  process.exit(1);
}
console.log(`✓ All checks passed${skipped ? ` (${skipped} skipped)` : ""}.`);
if (adminCleanupDone) {
  console.log("Smoke rows (booking + inquiry) were deleted by the admin run.");
} else {
  console.log(`Note: labeled rows remain in the database (booking + inquiry named "${BOOKING_NAME}").`);
  console.log("Remove them from the admin UI (/admin/bookings, /admin/inquiries with an");
  console.log("admin account) or with SQL — see the Phase 4 report.");
}