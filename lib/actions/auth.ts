"use server";

/**
 * Staff authentication actions (Supabase Auth, email + password).
 *
 * login  — validates with Zod, signs in with Supabase Auth (which sets
 *          the encrypted session cookies via @supabase/ssr), then
 *          redirects into the admin area. The profile/role check is NOT
 *          trusted for security (RLS enforces it on every query) — it
 *          only gives non-staff accounts a clear message instead of an
 *          empty dashboard.
 * logout  — destroys the session and returns to the login page.
 */
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { loginSchema } from "@/lib/validation";
import { formObject } from "@/lib/form";
import { zodFailure, type ActionResult } from "./types";

export async function login(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  if (!hasSupabaseEnv()) {
    return { success: false, error: "Supabase n'est pas configuré." };
  }

  const parsed = loginSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return zodFailure(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    // Deliberately vague: never reveal whether the e-mail exists.
    return { success: false, error: "Identifiants incorrects." };
  }

  // Signed in. The session cookies are set — send the user to the admin
  // dashboard (the layout guard double-checks the staff role).
  redirect("/admin");
}

export async function logout(): Promise<void> {
  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}