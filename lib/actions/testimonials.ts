"use server";

/**
 * Testimonial mutations (staff CRUD).
 */
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { testimonialSchema } from "@/lib/validation";
import { formBool, formNum, formStr } from "@/lib/form";
import { zodFailure, type ActionResult } from "./types";

function parseTestimonialForm(formData: FormData) {
  return testimonialSchema.safeParse({
    authorName: formStr(formData, "authorName"),
    authorCountry: formStr(formData, "authorCountry"),
    rating: formNum(formData, "rating"),
    quoteFr: formStr(formData, "quoteFr"),
    quoteEn: formStr(formData, "quoteEn"),
    quoteAr: formStr(formData, "quoteAr"),
    avatarUrl: formStr(formData, "avatarUrl"),
    isPublished: formBool(formData, "isPublished"),
  });
}

function testimonialColumns(data: z.infer<typeof testimonialSchema>) {
  return {
    author_name: data.authorName,
    author_country: data.authorCountry,
    rating: data.rating,
    quote_fr: data.quoteFr,
    quote_en: data.quoteEn,
    quote_ar: data.quoteAr,
    avatar_url: data.avatarUrl,
    is_published: data.isPublished,
  };
}

export async function createTestimonial(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const parsed = parseTestimonialForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("testimonials")
    .insert(testimonialColumns(parsed.data));

  if (error) {
    console.error("createTestimonial failed:", error.message);
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("testimonials");
  // redirect() throws: it must come after the cache refresh (see tours.ts).
  redirect("/admin/testimonials");
}

export async function updateTestimonial(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant d'avis invalide." };
  }

  const parsed = parseTestimonialForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("testimonials")
    .update(testimonialColumns(parsed.data))
    .eq("id", id.data);

  if (error) {
    console.error("updateTestimonial failed:", error.message);
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("testimonials");
  return { success: true };
}

export async function deleteTestimonial(formData: FormData): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant d'avis invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id.data);

  if (error) {
    console.error("deleteTestimonial failed:", error.message);
    return { success: false, error: "Suppression impossible." };
  }

  updateTag("testimonials");
  return { success: true };
}

export async function setTestimonialPublished(
  testimonialId: string,
  isPublished: boolean
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(testimonialId);
  if (!id.success) {
    return { success: false, error: "Identifiant d'avis invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("testimonials")
    .update({ is_published: isPublished })
    .eq("id", testimonialId);

  if (error) {
    return { success: false, error: error.message };
  }

  updateTag("testimonials");
  return { success: true };
}