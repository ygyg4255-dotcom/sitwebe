/**
 * Admin chrome (server component): top bar with the agency name, the
 * signed-in staff member and the logout form, plus the side navigation.
 * French-only by design — like the validation messages and the admin
 * area as a whole, it follows the established conventions (see
 * lib/validation.ts and app/[locale]/not-found.tsx).
 */
import Link from "next/link";
import type { Profile } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: "◆" },
  { href: "/admin/bookings", label: "Réservations", icon: "📅" },
  { href: "/admin/inquiries", label: "Messages", icon: "✉" },
  { href: "/admin/tours", label: "Circuits", icon: "🧭" },
  { href: "/admin/destinations", label: "Destinations", icon: "📍" },
  { href: "/admin/testimonials", label: "Avis clients", icon: "★" },
  { href: "/admin/blog", label: "Blog", icon: "✎" },
  { href: "/admin/faqs", label: "FAQ", icon: "?" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙" },
];

export function AdminShell({
  profile,
  agencyName,
  children,
}: {
  profile: Profile;
  agencyName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {/* Top bar */}
      <header className="border-b border-brand-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-lg leading-none text-white"
            >
              ◆
            </span>
            <span className="font-display text-lg">{agencyName}</span>
            <span className="rounded-full border border-brand-border px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">
              {profile.full_name} ·{" "}
              <span className="font-medium text-secondary">
                {profile.role === "admin" ? "administrateur" : "éditeur"}
              </span>
            </span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row">
        {/* Side navigation */}
        <nav aria-label="Administration" className="lg:w-56 lg:shrink-0">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-sand hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}