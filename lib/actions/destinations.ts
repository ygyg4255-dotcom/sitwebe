"use server";

/**
 * Destination mutations (staff CRUD).
 * Guards: requireStaff → Zod → mutation (RLS double-checks) →
 * updateTag("destinations").
 */
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { destinationSchema } from "@/lib/validation";
import { formBool, formNum, formStr } from "@/lib/form";
import { zodFailure, type ActionResult } from "./types";

function parseDestinationForm(formData: FormData) {
  return destinationSchema.safeParse({
    slug: formStr(formData, "slug"),
    nameFr: formStr(formData, "nameFr"),
    nameEn: formStr(formData, "nameEn"),
    nameAr: formStr(formData, "nameAr"),
    descriptionFr: formStr(formData, "descriptionFr"),
    descriptionEn: formStr(formData, "descriptionEn"),
    descriptionAr: formStr(formData, "descriptionAr"),
    imageUrl: formStr(formData, "imageUrl"),
    isPublished: formBool(formData, "isPublished"),
    sortOrder: formNum(formData, "sortOrder"),
  });
}

function destinationColumns(data: z.infer<typeof destinationSchema>) {
  return {
    slug: data.slug,
    name_fr: data.nameFr,
    name_en: data.nameEn,
    name_ar: data.nameAr,
    description_fr: data.descriptionFr,
    description_en: data.descriptionEn,
    description_ar: data.descriptionAr,
    image_url: data.imageUrl,
    is_published: data.isPublished,
    sort_order: data.sortOrder,
  };
}

export async function createDestination(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const parsed = parseDestinationForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("destinations")
    .insert(destinationColumns(parsed.data));

  if (error) {
    console.error("createDestination failed:", error.message);
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ce slug est déjà utilisé.",
        fieldErrors: { slug: "Ce slug est déjà utilisé." },
      };
    }
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("destinations");
  // redirect() throws: it must come after the cache refresh (see tours.ts).
  redirect("/admin/destinations");
}

export async function updateDestination(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant de destination invalide." };
  }

  const parsed = parseDestinationForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("destinations")
    .update(destinationColumns(parsed.data))
    .eq("id", id.data);

  if (error) {
    console.error("updateDestination failed:", error.message);
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ce slug est déjà utilisé.",
        fieldErrors: { slug: "Ce slug est déjà utilisé." },
      };
    }
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("destinations");
  return { success: true };
}

export async function deleteDestination(formData: FormData): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant de destination invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("destinations").delete().eq("id", id.data);

  if (error) {
    console.error("deleteDestination failed:", error.message);
    return { success: false, error: "Suppression impossible." };
  }

  updateTag("destinations");
  return { success: true };
}

export async function setDestinationPublished(
  destinationId: string,
  isPublished: boolean
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(destinationId);
  if (!id.success) {
    return { success: false, error: "Identifiant de destination invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("destinations")
    .update({ is_published: isPublished })
    .eq("id", destinationId);

  if (error) {
    return { success: false, error: error.message };
  }

  updateTag("destinations");
  return { success: true };
}