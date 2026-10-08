import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";
import { requireSupabaseEnv } from "./env";

/**
 * Browser client for client components (auth flows in Phase 4:
 * login form, logout button). Cookie-based, so the session created
 * by the server is shared automatically.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}