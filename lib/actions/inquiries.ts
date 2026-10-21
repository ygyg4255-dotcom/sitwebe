"use server";

/**
 * Contact inquiry actions.
 *
 * submitInquiry (public): anonymous INSERT only (RLS).
 * markInquiryRead (staff) / deleteInquiry (admin): inbox management,
 * matching the RLS policies (defense in depth).
 *
 * After a successful insert, the agency is notified by e-mail via
 * Resend (lib/email.ts) — best-effort, never fails the request.
 */
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { inquirySchema } from "@/lib/validation";
import { formObject, formStr } from "@/lib/form";
import { sendInquiryNotification } from "@/lib/email";
import { zodFailure, type ActionResult } from "./types";

export async function submitInquiry(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!hasSupabaseEnv()) {
    return { success: false, error: "Envoi impossible pour le moment." };
  }

  const parsed = inquirySchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return zodFailure(parsed.error);
  }
  const inquiry = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("inquiries").insert({
    name: inquiry.name,
    email: inquiry.email,
    subject: inquiry.subject,
    message: inquiry.message,
  });

  if (error) {
    console.error("submitInquiry failed:", error.message);
    return { success: false, error: "Envoi impossible pour le moment." };
  }

  // Best-effort notification to the agency (skipped silently when
  // Resend is not configured; never fails the visitor's request).
  await sendInquiryNotification(inquiry);

  return { success: true };
}

/** Toggle the read flag of an inbox message (staff). */
export async function markInquiryRead(
  inquiryId: string,
  isRead: boolean
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(inquiryId);
  if (!id.success) {
    return { success: false, error: "Identifiant de message invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ is_read: isRead })
    .eq("id", inquiryId);

  if (error) {
    console.error("markInquiryRead failed:", error.message);
    return { success: false, error: "Mise à jour impossible." };
  }

  return { success: true };
}

/** Deleting an inquiry is admin-only (matches the RLS policy). */
export async function deleteInquiry(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant de message invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id.data);

  if (error) {
    console.error("deleteInquiry failed:", error.message);
    return { success: false, error: "Suppression impossible." };
  }

  return { success: true };
}