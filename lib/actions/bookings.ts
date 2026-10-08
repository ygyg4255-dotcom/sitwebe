"use server";

/**
 * Public submission actions: booking requests and contact inquiries.
 * No login required — the database's RLS policies allow anonymous
 * INSERTs on these two tables and nothing else.
 *
 * TODO(Phase 4): after a successful insert, send the notification email
 * to the agency via Resend (lib/email.ts) and wire these actions to the
 * actual forms (with pending/error states in the UI).
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bookingSchema, inquirySchema } from "@/lib/validation";
import type { ActionResult } from "./types";

export async function submitBooking(input: unknown): Promise<ActionResult> {
  // 1. Validate (Zod) — reject bad data before it reaches the database.
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }
  const booking = parsed.data;

  // 2. Insert (RLS: anonymous visitors may insert bookings, nothing else).
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("bookings").insert({
    tour_id: booking.tourId,
    departure_id: booking.departureId,
    full_name: booking.fullName,
    email: booking.email,
    phone: booking.phone,
    travel_date: booking.travelDate,
    num_adults: booking.numAdults,
    num_children: booking.numChildren,
    message: booking.message,
  });

  if (error) {
    console.error("submitBooking failed:", error.message);
    return { success: false, error: "Envoi impossible pour le moment." };
  }

  return { success: true };
}

export async function submitInquiry(input: unknown): Promise<ActionResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
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

  return { success: true };
}