import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { requireSupabaseEnv } from "./env";

/**
 * PUBLIC data reader (server-side only).
 *
 * Uses the anonymous key, so the database's Row Level Security treats
 * every request as an anonymous visitor: it can only ever read PUBLISHED
 * content — even if a bug creeps into this application code, the
 * database refuses anything else.
 *
 * Use for: Server Components and "use cache" data functions (queries).
 * Never use for mutations or staff/admin data (see supabase/server.ts).
 */
export function createPublicClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createClient<Database>(url, anonKey);
}