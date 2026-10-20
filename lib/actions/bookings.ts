"use server";

/**
 * Booking actions.
 *
 * submitBooking (public): no login required — the database's RLS allows
 * anonymous INSERTs on bookings and nothing else. The action validates
 * with Zod, then re-verifies the tour/departure references from the
 * database (never trusting the client's IDs, per the Server Actions
 * security guide) before inserting.
 *
 * updateBookingStatus / deleteBooking (admin): status workflow
 * new → contacted → confirmed / cancelled; deletes are admin-only,
 * matching the RLS policies (defense in depth).
 *
 * TODO(Phase 5): after a successful insert, send the notification email
 * to the agency via Resend (lib/email.ts).
 */
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { bookingSchema, bookingStatusSchema } from "@/lib/validation";
import { formObject, formStr } from "@/lib/form";
import { zodFailure, type ActionResult } from "./types";

export async function submitBooking(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!hasSupabaseEnv()) {
    return { success: false, error: "Envoi impossible pour le moment." };
  }

  // 1. Validate (Zod) — reject bad data before it reaches the database.
  const parsed = bookingSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return zodFailure(parsed.error);
  }
  const booking = parsed.data;

  // 2. Re-verify the references from the database (untrusted client IDs):
  //    the tour must exist and be published; a departure must belong to
  //    that tour and not be in the past.
  const publicClient = createPublicClient();

  let tourOk = true;
  if (booking.tourId) {
    const { data: tour } = await publicClient
      .from("tours")
      .select("id")
      .eq("id", booking.tourId)
      .eq("is_published", true)
      .maybeSingle();
    tourOk = Boolean(tour);
  }

  let departureOk = true;
  if (booking.departureId) {
    const { data: departure } = await publicClient
      .from("tour_departures")
      .select("tour_id, start_date")
      .eq("id", booking.departureId)
      .maybeSingle();
    departureOk = Boolean(
      departure &&
        (!booking.tourId || departure.tour_id === booking.tourId) &&
        departure.start_date >= new Date().toISOString().slice(0, 10)
    );
  }

  if (!tourOk || !departureOk) {
    const fieldErrors: Record<string, string> = {};
    if (!tourOk) fieldErrors.tourId = "Ce circuit n'est plus disponible.";
    if (!departureOk) fieldErrors.departureId = "Ce départ n'est plus disponible.";
    return {
      success: false,
      error: Object.values(fieldErrors)[0],
      fieldErrors,
    };
  }

  // 3. Insert (RLS: anonymous visitors may insert bookings, nothing else).
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

/** Status workflow management (staff): new → contacted → confirmed / cancelled. */
export async function updateBookingStatus(
  bookingId: string,
  status: string
): Promise<ActionResult> {
  await requireStaff();

  const parsed = bookingStatusSchema.safeParse({ bookingId, status });
  if (!parsed.success) {
    return zodFailure(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.bookingId);

  if (error) {
    console.error("updateBookingStatus failed:", error.message);
    return { success: false, error: "Mise à jour impossible." };
  }

  return { success: true };
}

/** Deleting a booking is admin-only (matches the RLS policy). */
export async function deleteBooking(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant de réservation invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id.data);

  if (error) {
    console.error("deleteBooking failed:", error.message);
    return { success: false, error: "Suppression impossible." };
  }

  return { success: true };
}