import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types/database";
import { requireSupabaseEnv } from "./env";

/**
 * Server client WITH the user's auth session (cookie-based).
 *
 * Use for: Server Actions (mutations) and anything that depends on who
 * is logged in. Row Level Security evaluates policies against the
 * authenticated user, so staff-only writes are enforced by the database.
 *
 * Create a fresh client per request — never share it across requests.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component (no writes allowed) — safe to
          // ignore; session refresh happens in the layout Server Action
          // (Phase 4) or on the next server action.
        }
      },
    },
  });
}