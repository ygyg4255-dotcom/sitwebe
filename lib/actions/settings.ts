"use server";

/**
 * White-label settings mutation — the ONLY way site branding changes.
 * Guards: requireStaff (logged-in editor/admin) → Zod validation →
 * database update (RLS double-checks the role) → cache refresh.
 */
import { updateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth";
import { siteSettingsSchema } from "@/lib/validation";
import { formStr } from "@/lib/form";
import { zodFailure, type ActionResult } from "./types";

export async function updateSiteSettings(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // 1. Only logged-in staff may proceed (others redirect to the login).
  await requireStaff();

  // 2. Validate every field — colors must be hex, URLs must be URLs, …
  const parsed = siteSettingsSchema.safeParse({
    agencyName: formStr(formData, "agencyName"),
    tagline: formStr(formData, "tagline"),
    logoUrl: formStr(formData, "logoUrl"),
    primaryColor: formStr(formData, "primaryColor"),
    primaryDarkColor: formStr(formData, "primaryDarkColor"),
    accentColor: formStr(formData, "accentColor"),
    secondaryColor: formStr(formData, "secondaryColor"),
    inkColor: formStr(formData, "inkColor"),
    paperColor: formStr(formData, "paperColor"),
    sandColor: formStr(formData, "sandColor"),
    surfaceColor: formStr(formData, "surfaceColor"),
    mutedColor: formStr(formData, "mutedColor"),
    borderColor: formStr(formData, "borderColor"),
    phone: formStr(formData, "phone"),
    whatsapp: formStr(formData, "whatsapp"),
    email: formStr(formData, "email"),
    address: formStr(formData, "address"),
    city: formStr(formData, "city"),
    facebookUrl: formStr(formData, "facebookUrl"),
    instagramUrl: formStr(formData, "instagramUrl"),
    tripadvisorUrl: formStr(formData, "tripadvisorUrl"),
  });
  if (!parsed.success) {
    return zodFailure(parsed.error);
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
    console.error("updateSiteSettings failed:", error.message);
    return { success: false, error: "Enregistrement impossible." };
  }

  // 4. Refresh the cached settings so public pages re-render (ISR).
  //    (Next 16: updateTag = immediate, read-your-own-writes expiry
  //    from a Server Action; revalidateTag now needs a cache profile.)
  updateTag("site-settings");

  return { success: true };
}