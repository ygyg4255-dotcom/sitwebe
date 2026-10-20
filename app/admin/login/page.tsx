/**
 * Admin login page (public — deliberately outside the (protected)
 * group so the guard doesn't redirect logged-out visitors into a
 * loop). The login action verifies credentials via Supabase Auth and
 * redirects to /admin on success.
 *
 * The "already signed in?" check reads cookies: per the cacheComponents
 * pattern it sits inside a Suspense boundary so the login shell stays
 * prerenderable.
 */
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getBranding } from "@/lib/config/site";
import { getCurrentProfile } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Connexion" };

/** Redirects straight to the dashboard if the visitor is already staff. */
async function LoggedInRedirect() {
  const profile = await getCurrentProfile();
  if (profile && (profile.role === "admin" || profile.role === "editor")) {
    redirect("/admin");
  }
  return null;
}

export default async function AdminLoginPage() {
  const branding = await getBranding();

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Suspense fallback={null}>
          <LoggedInRedirect />
        </Suspense>
        <div className="mb-8 text-center">
          <span
            aria-hidden="true"
            className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-xl text-white"
          >
            ◆
          </span>
          <h1 className="font-display text-3xl text-ink">{branding.agencyName}</h1>
          <p className="mt-1 text-sm text-muted">Espace d&apos;administration</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}