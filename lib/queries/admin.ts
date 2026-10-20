/**
 * Admin queries (staff-only, per-request).
 *
 * Unlike lib/queries/*.ts these run with the logged-in user's session
 * (createSupabaseServerClient), so the database's RLS policies decide
 * what is visible: staff see drafts and customer data, everyone else
 * gets nothing. They are therefore NEVER cached — "use cache" would
 * leak one user's view to another and cookies() cannot be read inside
 * a cached function anyway.
 *
 * Error convention: a failed query logs and returns []/null — the
 * (protected) layout has already verified the staff session, so an
 * empty result renders the admin empty states.
 */
import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { TableRow } from "@/lib/types/database";

export type TourRow = TableRow<"tours">;
export type ItineraryRow = TableRow<"tour_itinerary">;
export type DepartureRow = TableRow<"tour_departures">;
export type DestinationRow = TableRow<"destinations">;
export type TestimonialRow = TableRow<"testimonials">;
export type BlogPostRow = TableRow<"blog_posts">;
export type FaqRow = TableRow<"faqs">;
export type BookingRow = TableRow<"bookings">;
export type InquiryRow = TableRow<"inquiries">;
export type SiteSettingsRow = TableRow<"site_settings">;

const MAX_RESULTS = 200;

// ── Catalog (drafts included — RLS allows staff to see them) ───────────

export async function getStaffTours(): Promise<TourRow[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(MAX_RESULTS);
  if (error) {
    console.error("getStaffTours failed:", error.message);
    return [];
  }
  return data;
}

export async function getStaffTourById(id: string): Promise<TourRow | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getStaffTourById failed:", error.message);
    return null;
  }
  return data;
}

export async function getStaffItinerary(tourId: string): Promise<ItineraryRow[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tour_itinerary")
    .select("*")
    .eq("tour_id", tourId)
    .order("day_number", { ascending: true });
  if (error) {
    console.error("getStaffItinerary failed:", error.message);
    return [];
  }
  return data;
}

export async function getStaffDepartures(tourId: string): Promise<DepartureRow[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tour_departures")
    .select("*")
    .eq("tour_id", tourId)
    .order("start_date", { ascending: true });
  if (error) {
    console.error("getStaffDepartures failed:", error.message);
    return [];
  }
  return data;
}

export async function getStaffDestinations(): Promise<DestinationRow[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(MAX_RESULTS);
  if (error) {
    console.error("getStaffDestinations failed:", error.message);
    return [];
  }
  return data;
}

export async function getStaffDestinationById(id: string): Promise<DestinationRow | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getStaffDestinationById failed:", error.message);
    return null;
  }
  return data;
}

export async function getStaffTestimonials(): Promise<TestimonialRow[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(MAX_RESULTS);
  if (error) {
    console.error("getStaffTestimonials failed:", error.message);
    return [];
  }
  return data;
}

export async function getStaffTestimonialById(id: string): Promise<TestimonialRow | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getStaffTestimonialById failed:", error.message);
    return null;
  }
  return data;
}

export async function getStaffBlogPosts(): Promise<BlogPostRow[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(MAX_RESULTS);
  if (error) {
    console.error("getStaffBlogPosts failed:", error.message);
    return [];
  }
  return data;
}

export async function getStaffBlogPostById(id: string): Promise<BlogPostRow | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getStaffBlogPostById failed:", error.message);
    return null;
  }
  return data;
}

export async function getStaffFaqs(): Promise<FaqRow[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(MAX_RESULTS);
  if (error) {
    console.error("getStaffFaqs failed:", error.message);
    return [];
  }
  return data;
}

export async function getStaffFaqById(id: string): Promise<FaqRow | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getStaffFaqById failed:", error.message);
    return null;
  }
  return data;
}

// ── Customer data (bookings / inquiries — staff-only via RLS) ─────────

export async function getStaffBookings(): Promise<BookingRow[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(MAX_RESULTS);
  if (error) {
    console.error("getStaffBookings failed:", error.message);
    return [];
  }
  return data;
}

export async function getStaffInquiries(): Promise<InquiryRow[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(MAX_RESULTS);
  if (error) {
    console.error("getStaffInquiries failed:", error.message);
    return [];
  }
  return data;
}

export async function getStaffSettings(): Promise<SiteSettingsRow | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("getStaffSettings failed:", error.message);
    return null;
  }
  return data;
}