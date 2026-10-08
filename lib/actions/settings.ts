"use server";

/**
 * White-label settings mutation — the ONLY way site branding changes.
 * Guards: requireStaff (logged-in editor/admin) → Zod validation →
 * database update (RLS double-checks the role) → cache refresh.
 */
import { updateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteSettingsSchema } from "@/lib/validation";
import type { ActionResult } from "./types";

export async function updateSiteSettings(input: unknown): Promise<ActionResult> {
  // 1. Only logged-in staff may proceed (Phase 4 redirects to login).
  await requireStaff();

  // 2. Validate every field — colors must be hex, URLs must be URLs, …
  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }
  const settings = parsed.data;

  // 3. Persist (RLS restricts the update to staff).
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      agency_name: settings.agencyName,
      tagline: settings.tagline,
      logo_url: settings.logoUrl,
      primary_color: settings.primaryColor,
      primary_dark_color: settings.primaryDarkColor,
      accent_color: settings.accentColor,
      secondary_color: settings.secondaryColor,
      ink_color: settings.inkColor,
      paper_color: settings.paperColor,
      sand_color: settings.sandColor,
      surface_color: settings.surfaceColor,
      muted_color: settings.mutedColor,
      border_color: settings.borderColor,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
      address: settings.address,
      city: settings.city,
      facebook_url: settings.facebookUrl,
      instagram_url: settings.instagramUrl,
      tripadvisor_url: settings.tripadvisorUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { success: false, error: error.message };
  }

  // 4. Refresh the cached settings so public pages re-render (ISR).
  //    (Next 16: updateTag = immediate, read-your-own-writes expiry
  //    from a Server Action; revalidateTag now needs a cache profile.)
  updateTag("site-settings");

  return { success: true };
}