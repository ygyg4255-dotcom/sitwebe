/**
 * Tour queries (public, read-only).
 *
 * All functions are cached ("use cache") with the "tours" tag: tour
 * pages render statically, and staff mutations from the admin area
 * (publish/unpublish, CRUD) refresh the cache via updateTag("tours").
 *
 * RLS note: these run with the anonymous key, so the database itself
 * filters to is_published = true — the .eq() below is a belt-and-braces
 * filter that also documents intent.
 */
import "server-only";
import { cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { TableRow } from "@/lib/types/database";

export type TourRow = TableRow<"tours">;
export type ItineraryRow = TableRow<"tour_itinerary">;
export type DepartureRow = TableRow<"tour_departures">;

const MAX_RESULTS = 100; // safety limit for every list query

export async function getPublishedTours(limit = MAX_RESULTS): Promise<TourRow[]> {
  "use cache";
  cacheTag("tours");

  if (!hasSupabaseEnv()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getPublishedTours failed:", error.message);
    return [];
  }
  return data;
}

/** Tours flagged for the homepage carousel, newest first. */
export async function getFeaturedTours(limit = 3): Promise<TourRow[]> {
  "use cache";
  cacheTag("tours");

  if (!hasSupabaseEnv()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedTours failed:", error.message);
    return [];
  }
  return data;
}

/** Single published tour by its slug (null = not found or a draft). */
export async function getPublishedTourBySlug(slug: string): Promise<TourRow | null> {
  "use cache";
  cacheTag("tours");

  if (!hasSupabaseEnv()) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("getPublishedTourBySlug failed:", error.message);
    return null;
  }
  return data;
}

/**
 * Day-by-day itinerary of a published tour, ordered by day.
 * (RLS only returns these while the parent tour is published.)
 */
export async function getItinerary(tourId: string): Promise<ItineraryRow[]> {
  "use cache";
  cacheTag("tours");

  if (!hasSupabaseEnv()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("tour_itinerary")
    .select("*")
    .eq("tour_id", tourId)
    .order("day_number", { ascending: true });

  if (error) {
    console.error("getItinerary failed:", error.message);
    return [];
  }
  return data;
}

/** Scheduled departures of a published tour, upcoming first. */
export async function getDepartures(tourId: string): Promise<DepartureRow[]> {
  "use cache";
  cacheTag("tours");

  if (!hasSupabaseEnv()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("tour_departures")
    .select("*")
    .eq("tour_id", tourId)
    .order("start_date", { ascending: true });

  if (error) {
    console.error("getDepartures failed:", error.message);
    return [];
  }
  return data;
}