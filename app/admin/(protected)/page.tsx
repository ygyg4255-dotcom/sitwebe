/**
 * ADMIN DASHBOARD — overview cards plus the latest bookings and
 * messages, so the agency sees incoming demand at a glance.
 */
import Link from "next/link";
import {
  getStaffBookings,
  getStaffInquiries,
  getStaffTours,
} from "@/lib/queries/admin";
import { Card } from "@/components/ui/Card";
import {
  AdminEmptyState,
  StatusBadge,
  formatDateTimeFr,
} from "@/components/admin/AdminBits";

export const metadata = { title: "Tableau de bord" };

function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const [bookings, inquiries, tours] = await Promise.all([
    getStaffBookings(),
    getStaffInquiries(),
    getStaffTours(),
  ]);

  const newBookings = bookings.filter((booking) => booking.status === "new").length;
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed").length;
  const unreadInquiries = inquiries.filter((inquiry) => !inquiry.is_read).length;
  const publishedTours = tours.filter((tour) => tour.is_published).length;

  const recentBookings = bookings.slice(0, 5);
  const recentInquiries = inquiries.slice(0, 5);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink sm:text-3xl">Tableau de bord</h1>
      <p className="mt-1 text-sm text-muted">Vue d&apos;ensemble de l&apos;activité de l&apos;agence.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Réservations"
          value={bookings.length}
          hint={`${newBookings} nouvelle(s) · ${confirmedBookings} confirmée(s)`}
        />
        <StatCard
          label="Messages non lus"
          value={unreadInquiries}
          hint={`${inquiries.length} message(s) au total`}
        />
        <StatCard
          label="Circuits publiés"
          value={`${publishedTours}/${tours.length}`}
          hint="Brouillons inclus dans le total"
        />
        <StatCard
          label="Circuits en vedette"
          value={tours.filter((tour) => tour.is_featured).length}
          hint="Affichés sur la page d'accueil"
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Latest bookings */}
        <section aria-labelledby="dashboard-bookings">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="dashboard-bookings" className="font-display text-lg text-ink">
              Dernières réservations
            </h2>
            <Link href="/admin/bookings" className="text-sm font-medium text-secondary underline">
              Tout voir
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <AdminEmptyState title="Aucune réservation pour le moment." />
          ) : (
            <ul className="space-y-3">
              {recentBookings.map((booking) => (
                <li key={booking.id}>
                  <Card className="flex flex-wrap items-center justify-between gap-2 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{booking.full_name}</p>
                      <p className="text-xs text-muted">
                        {formatDateTimeFr(booking.created_at)} ·{" "}
                        {booking.num_adults} adulte(s)
                        {booking.num_children > 0 ? ` + ${booking.num_children} enfant(s)` : ""}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Latest inquiries */}
        <section aria-labelledby="dashboard-inquiries">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="dashboard-inquiries" className="font-display text-lg text-ink">
              Derniers messages
            </h2>
            <Link href="/admin/inquiries" className="text-sm font-medium text-secondary underline">
              Tout voir
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <AdminEmptyState title="Aucun message pour le moment." />
          ) : (
            <ul className="space-y-3">
              {recentInquiries.map((inquiry) => (
                <li key={inquiry.id}>
                  <Card className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate font-medium text-ink">{inquiry.name}</p>
                      {!inquiry.is_read ? (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                          Non lu
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{inquiry.message}</p>
                    <p className="mt-1 text-xs text-muted">{formatDateTimeFr(inquiry.created_at)}</p>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}