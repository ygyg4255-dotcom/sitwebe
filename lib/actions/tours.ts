"use server";

/**
 * Tour mutations (staff CRUD) — the reference pattern for all content
 * actions: requireStaff → Zod → insert/update/delete (RLS double-checks
 * the role) → updateTag("tours") so every cached public query refreshes.
 */
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { tourSchema } from "@/lib/validation";
import { formBool, formLines, formNum, formStr } from "@/lib/form";
import { zodFailure, type ActionResult } from "./types";

/** Parse the tour form into the shape tourSchema expects. */
function parseTourForm(formData: FormData) {
  return tourSchema.safeParse({
    destinationId: formStr(formData, "destinationId"),
    slug: formStr(formData, "slug"),
    titleFr: formStr(formData, "titleFr"),
    titleEn: formStr(formData, "titleEn"),
    titleAr: formStr(formData, "titleAr"),
    summaryFr: formStr(formData, "summaryFr"),
    summaryEn: formStr(formData, "summaryEn"),
    summaryAr: formStr(formData, "summaryAr"),
    descriptionFr: formStr(formData, "descriptionFr"),
    descriptionEn: formStr(formData, "descriptionEn"),
    descriptionAr: formStr(formData, "descriptionAr"),
    priceMad: formNum(formData, "priceMad"),
    durationDays: formNum(formData, "durationDays"),
    groupSizeMax: formNum(formData, "groupSizeMax"),
    difficulty: formStr(formData, "difficulty"),
    coverImageUrl: formStr(formData, "coverImageUrl"),
    included: formLines(formData, "included"),
    excluded: formLines(formData, "excluded"),
    isPublished: formBool(formData, "isPublished"),
    isFeatured: formBool(formData, "isFeatured"),
    departureLocation: formStr(formData, "departureLocation"),
    returnLocation: formStr(formData, "returnLocation"),
  });
}

/** Shared column mapping (validated input → database columns). */
function tourColumns(data: z.infer<typeof tourSchema>) {
  return {
    destination_id: data.destinationId,
    slug: data.slug,
    title_fr: data.titleFr,
    title_en: data.titleEn,
    title_ar: data.titleAr,
    summary_fr: data.summaryFr,
    summary_en: data.summaryEn,
    summary_ar: data.summaryAr,
    description_fr: data.descriptionFr,
    description_en: data.descriptionEn,
    description_ar: data.descriptionAr,
    price_mad: data.priceMad,
    duration_days: data.durationDays,
    group_size_max: data.groupSizeMax,
    difficulty: data.difficulty,
    cover_image_url: data.coverImageUrl,
    included: data.included,
    excluded: data.excluded,
    is_published: data.isPublished,
    is_featured: data.isFeatured,
    departure_location: data.departureLocation,
    return_location: data.returnLocation,
    updated_at: new Date().toISOString(),
  };
}

export async function createTour(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const parsed = parseTourForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tours")
    .insert(tourColumns(parsed.data));

  if (error) {
    console.error("createTour failed:", error.message);
    // A duplicate slug is the most likely user-facing conflict.
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ce slug est déjà utilisé.",
        fieldErrors: { slug: "Ce slug est déjà utilisé." },
      };
    }
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("tours");
  // redirect() throws: it must come after the cache refresh. Landing on
  // the list avoids a stale "new" form after a successful create.
  redirect("/admin/tours");
}

export async function updateTour(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant de circuit invalide." };
  }

  const parsed = parseTourForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tours")
    .update(tourColumns(parsed.data))
    .eq("id", id.data);

  if (error) {
    console.error("updateTour failed:", error.message);
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ce slug est déjà utilisé.",
        fieldErrors: { slug: "Ce slug est déjà utilisé." },
      };
    }
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("tours");
  return { success: true };
}

export async function deleteTour(formData: FormData): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant de circuit invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tours").delete().eq("id", id.data);

  if (error) {
    console.error("deleteTour failed:", error.message);
    return { success: false, error: "Suppression impossible." };
  }

  updateTag("tours");
  return { success: true };
}

/** Publish or unpublish a tour (changes its public visibility). */
export async function setTourPublished(
  tourId: string,
  isPublished: boolean
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(tourId);
  if (!id.success) {
    return { success: false, error: "Identifiant de circuit invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tours")
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq("id", tourId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Refresh every cached query that reads tours (list, featured, detail).
  // (Next 16: updateTag = immediate expiry from a Server Action.)
  updateTag("tours");

  return { success: true };
}