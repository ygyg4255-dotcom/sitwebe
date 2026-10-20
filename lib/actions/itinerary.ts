"use server";

/**
 * Tour itinerary mutations (staff CRUD) — the day-by-day program of a
 * tour. Managed from the parent tour's admin page; the day number is
 * unique per tour (DB unique constraint, migration 0002).
 */
import { updateTag } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { itinerarySchema } from "@/lib/validation";
import { formNum, formStr } from "@/lib/form";
import { zodFailure, type ActionResult } from "./types";

function parseItineraryForm(formData: FormData) {
  return itinerarySchema.safeParse({
    tourId: formStr(formData, "tourId"),
    dayNumber: formNum(formData, "dayNumber"),
    titleFr: formStr(formData, "titleFr"),
    titleEn: formStr(formData, "titleEn"),
    titleAr: formStr(formData, "titleAr"),
    descriptionFr: formStr(formData, "descriptionFr"),
    descriptionEn: formStr(formData, "descriptionEn"),
    descriptionAr: formStr(formData, "descriptionAr"),
  });
}

function itineraryColumns(data: z.infer<typeof itinerarySchema>) {
  return {
    day_number: data.dayNumber,
    title_fr: data.titleFr,
    title_en: data.titleEn,
    title_ar: data.titleAr,
    description_fr: data.descriptionFr,
    description_en: data.descriptionEn,
    description_ar: data.descriptionAr,
  };
}

export async function createItineraryDay(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const parsed = parseItineraryForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tour_itinerary")
    .insert({ ...itineraryColumns(parsed.data), tour_id: parsed.data.tourId });

  if (error) {
    console.error("createItineraryDay failed:", error.message);
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ce numéro de jour existe déjà pour ce circuit.",
        fieldErrors: { dayNumber: "Ce jour existe déjà." },
      };
    }
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("tours");
  return { success: true };
}

export async function updateItineraryDay(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant d'étape invalide." };
  }

  const parsed = parseItineraryForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tour_itinerary")
    .update(itineraryColumns(parsed.data))
    .eq("id", id.data);

  if (error) {
    console.error("updateItineraryDay failed:", error.message);
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ce numéro de jour existe déjà pour ce circuit.",
        fieldErrors: { dayNumber: "Ce jour existe déjà." },
      };
    }
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("tours");
  return { success: true };
}

export async function deleteItineraryDay(formData: FormData): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant d'étape invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tour_itinerary").delete().eq("id", id.data);

  if (error) {
    console.error("deleteItineraryDay failed:", error.message);
    return { success: false, error: "Suppression impossible." };
  }

  updateTag("tours");
  return { success: true };
}