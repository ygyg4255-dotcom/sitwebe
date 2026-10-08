/**
 * Central access to the Supabase environment variables.
 * Keeps the "is Supabase configured yet?" check in ONE place so the rest
 * of the code never reads process.env directly.
 *
 * The site builds and runs even WITHOUT these variables set (it falls
 * back to the demo branding / demo data) — see lib/config/site.ts.
 */

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Reads the env vars and throws a helpful error if they are missing. */
export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: copy .env.local.example to .env.local " +
        "and set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "(Supabase Dashboard → Project Settings → API)."
    );
  }
  return { url, anonKey };
}