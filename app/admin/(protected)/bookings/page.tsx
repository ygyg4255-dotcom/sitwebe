/**
 * BOOKINGS ADMIN — the reservation inbox: customer requests received
 * through the public booking form, with the status workflow
 * (new → contacted → confirmed / cancelled) and, for admins only, the
 * destructive delete. Tours are joined client-side via an id→title map.
 */
import { getCurrentProfile } from "@/lib/auth";
import { getStaffBookings, getStaffTours } from "@/lib/queries/admin";
import { deleteBooking } from "@/lib/actions/bookings";
import { BookingStatusForm, DeleteForm } from "@/components/admin/Controls";
import {
  AdminEmptyState,
  AdminPageHeader,
  StatusBadge,
  formatDateFr,
  formatDateTimeFr,
} from "@/components/admin/AdminBits";

export const metadata = { title: "Réservations" };

export default async function AdminBookingsPage() {
  const [bookings, tours, profile] = await Promise.all([
    getStaffBookings(),
    getStaffTours(),
    getCurrentProfile(),
  ]);
  const tourTitles = new Map(tours.map((tour) => [tour.id, tour.title_fr]));
  const isAdmin = profile?.role === "admin";

  return (
    <div>
      <AdminPageHeader
        title="Réservations"
        description={`${bookings.length} demande(s) reçue(s) via le formulaire public.`}
      />

      {bookings.length === 0 ? (
        <AdminEmptyState
          title="Aucune réservation pour le moment."
          hint="Les demandes envoyées depuis les pages des circuits apparaîtront ici."
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-2xl border border-brand-border bg-surface p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium text-ink">{booking.full_name}</h2>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {tourTitles.get(booking.tour_id ?? "") ?? "Circuit supprimé"} ·{" "}
                    {booking.num_adults} adulte(s)
                    {booking.num_children > 0 ? ` + ${booking.num_children} enfant(s)` : ""}
                    {booking.travel_date ? ` · Départ souhaité : ${formatDateFr(booking.travel_date)}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Reçue le {formatDateTimeFr(booking.created_at)} · {booking.email}
                    {booking.phone ? ` · ${booking.phone}` : ""}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <BookingStatusForm bookingId={booking.id} status={booking.status} />
                  {isAdmin ? (
                    <DeleteForm
                      id={booking.id}
                      action={deleteBooking}
                      label="Supprimer"
                      confirmText="Supprimer définitivement cette réservation ?"
                    />
                  ) : null}
                </div>
              </div>

              {booking.message ? (
                <p className="mt-3 rounded-xl bg-sand px-3 py-2 text-sm text-ink">
                  {booking.message}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}