import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { TableRow } from "@/lib/types/database";

export type Profile = TableRow<"profiles">;
export type StaffRole = Profile["role"]; // "admin" | "editor" (as strings)

/**
 * Returns the profile row of the currently logged-in staff member,
 * or null if the visitor is not logged in (or not staff).
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // The profile row is created automatically by the handle_new_user
  // trigger (migration 0001) when the user was added.
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data;
}

/**
 * Guard for Server Actions: stops the action unless the caller is a
 * logged-in staff member (admin or editor). Always call this FIRST in
 * any mutating action — combined with RLS it is defense in depth.
 * Unauthenticated or non-staff callers land on the admin login page.
 */
export async function requireStaff(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "editor")) {
    redirect("/admin/login");
  }
  return profile;
}

/** Same as requireStaff but additionally requires the "admin" role. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/admin/login");
  }
  return profile;
}