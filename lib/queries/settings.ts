/**
 * Site settings — the database side of the white-label branding
 * contract. `lib/config/site.ts` consumes this and maps the row to the
 * SiteBranding interface.
 *
 * Cached ("use cache") so public pages render statically (ISR): the
 * `updateSiteSettings` Server Action refreshes it via
 * updateTag("site-settings").
 */
import "server-only";
import { cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { TableRow } from "@/lib/types/database";

export type SiteSettingsRow = TableRow<"site_settings">;

export async function getSiteSettings(): Promise<SiteSettingsRow | null> {
  "use cache";
  cacheTag("site-settings");

  if (!hasSupabaseEnv()) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1) // the table has exactly one row (enforced by a check)
    .maybeSingle();

  if (error) {
    // Never break the public site over a settings problem — the caller
    // falls back to the default branding.
    console.error("getSiteSettings failed:", error.message);
    return null;
  }

  return data;
}