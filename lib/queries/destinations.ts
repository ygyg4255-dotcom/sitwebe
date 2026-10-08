/**
 * Destination queries (public, read-only).
 * Tag "destinations": refreshed by destination mutations (Phase 4).
 */
import "server-only";
import { cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { TableRow } from "@/lib/types/database";

export type DestinationRow = TableRow<"destinations">;

const MAX_RESULTS = 100;

export async function getPublishedDestinations(
  limit = MAX_RESULTS
): Promise<DestinationRow[]> {
  "use cache";
  cacheTag("destinations");

  if (!hasSupabaseEnv()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getPublishedDestinations failed:", error.message);
    return [];
  }
  return data;
}

export async function getPublishedDestinationBySlug(
  slug: string
): Promise<DestinationRow | null> {
  "use cache";
  cacheTag("destinations");

  if (!hasSupabaseEnv()) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("getPublishedDestinationBySlug failed:", error.message);
    return null;
  }
  return data;
}