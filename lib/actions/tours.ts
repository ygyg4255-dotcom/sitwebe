"use server";

/**
 * Tour mutation — the reference pattern for all staff CRUD (Phase 4
 * expands this file with create/update/delete).
 * Guards: requireStaff → Zod → update (RLS double-checks) → updateTag.
 */
import { updateTag } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "./types";

/** Publish or unpublish a tour (changes its public visibility). */
export async function setTourPublished(
  tourId: string,
  isPublished: boolean
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(tourId);
  if (!id.success) {
    return { success: false, error: "Identifiant de circuit invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tours")
    .update({ is_published: isPublished })
    .eq("id", tourId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Refresh every cached query that reads tours (list, featured, detail).
  // (Next 16: updateTag = immediate expiry from a Server Action.)
  updateTag("tours");

  return { success: true };
}