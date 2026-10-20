"use server";

/**
 * Tour departure mutations (staff CRUD) — scheduled departure dates of
 * a tour, with an optional per-departure price and capacity. Departures
 * belong to their parent tour page in the admin area.
 */
import { updateTag } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { departureSchema } from "@/lib/validation";
import { formNum, formStr } from "@/lib/form";
import { zodFailure, type ActionResult } from "./types";

function parseDepartureForm(formData: FormData) {
  return departureSchema.safeParse({
    tourId: formStr(formData, "tourId"),
    startDate: formStr(formData, "startDate"),
    endDate: formStr(formData, "endDate"),
    priceMad: formNum(formData, "priceMad"),
    maxParticipants: formNum(formData, "maxParticipants"),
    bookedParticipants: formNum(formData, "bookedParticipants"),
  });
}

function departureColumns(data: z.infer<typeof departureSchema>) {
  return {
    start_date: data.startDate,
    end_date: data.endDate,
    price_mad: data.priceMad,
    max_participants: data.maxParticipants,
    booked_participants: data.bookedParticipants,
  };
}

export async function createDeparture(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const parsed = parseDepartureForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tour_departures")
    .insert({ ...departureColumns(parsed.data), tour_id: parsed.data.tourId });

  if (error) {
    console.error("createDeparture failed:", error.message);
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("tours"); // departures render on cached public tour pages
  return { success: true };
}

export async function updateDeparture(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant de départ invalide." };
  }

  const parsed = parseDepartureForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tour_departures")
    .update(departureColumns(parsed.data))
    .eq("id", id.data);

  if (error) {
    console.error("updateDeparture failed:", error.message);
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("tours");
  return { success: true };
}

export async function deleteDeparture(formData: FormData): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant de départ invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("tour_departures").delete().eq("id", id.data);

  if (error) {
    console.error("deleteDeparture failed:", error.message);
    return { success: false, error: "Suppression impossible." };
  }

  updateTag("tours");
  return { success: true };
}