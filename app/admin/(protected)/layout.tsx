/**
 * PROTECTED ADMIN LAYOUT — the auth gate for every /admin page except
 * /admin/login. Pattern from the Next 16 cacheComponents docs: the
 * guard reads cookies, so it runs inside a Suspense boundary (the
 * shell renders immediately, the guard streams in). A visitor without
 * a staff profile (admin or editor) is redirected to the login page;
 * RLS remains the real data boundary behind this UI guard.
 */
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getBranding } from "@/lib/config/site";
import { getCurrentProfile, type Profile } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

async function Guard({ children }: { children: React.ReactNode }) {
  const profile: Profile | null = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "editor")) {
    redirect("/admin/login");
  }

  const branding = await getBranding();
  return (
    <AdminShell profile={profile} agencyName={branding.agencyName}>
      {children}
    </AdminShell>
  );
}

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <p className="text-sm text-muted">Chargement de l&apos;administration…</p>
        </div>
      }
    >
      <Guard>{children}</Guard>
    </Suspense>
  );
}