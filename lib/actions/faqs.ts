"use server";

/**
 * FAQ mutations (staff CRUD).
 */
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { faqSchema } from "@/lib/validation";
import { formBool, formNum, formStr } from "@/lib/form";
import { zodFailure, type ActionResult } from "./types";

function parseFaqForm(formData: FormData) {
  return faqSchema.safeParse({
    questionFr: formStr(formData, "questionFr"),
    questionEn: formStr(formData, "questionEn"),
    questionAr: formStr(formData, "questionAr"),
    answerFr: formStr(formData, "answerFr"),
    answerEn: formStr(formData, "answerEn"),
    answerAr: formStr(formData, "answerAr"),
    sortOrder: formNum(formData, "sortOrder"),
    isPublished: formBool(formData, "isPublished"),
  });
}

function faqColumns(data: z.infer<typeof faqSchema>) {
  return {
    question_fr: data.questionFr,
    question_en: data.questionEn,
    question_ar: data.questionAr,
    answer_fr: data.answerFr,
    answer_en: data.answerEn,
    answer_ar: data.answerAr,
    sort_order: data.sortOrder,
    is_published: data.isPublished,
  };
}

export async function createFaq(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const parsed = parseFaqForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("faqs").insert(faqColumns(parsed.data));

  if (error) {
    console.error("createFaq failed:", error.message);
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("faqs");
  // redirect() throws: it must come after the cache refresh (see tours.ts).
  redirect("/admin/faqs");
}

export async function updateFaq(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant de question invalide." };
  }

  const parsed = parseFaqForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("faqs")
    .update(faqColumns(parsed.data))
    .eq("id", id.data);

  if (error) {
    console.error("updateFaq failed:", error.message);
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("faqs");
  return { success: true };
}

export async function deleteFaq(formData: FormData): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant de question invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id.data);

  if (error) {
    console.error("deleteFaq failed:", error.message);
    return { success: false, error: "Suppression impossible." };
  }

  updateTag("faqs");
  return { success: true };
}

export async function setFaqPublished(
  faqId: string,
  isPublished: boolean
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(faqId);
  if (!id.success) {
    return { success: false, error: "Identifiant de question invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("faqs")
    .update({ is_published: isPublished })
    .eq("id", faqId);

  if (error) {
    return { success: false, error: error.message };
  }

  updateTag("faqs");
  return { success: true };
}