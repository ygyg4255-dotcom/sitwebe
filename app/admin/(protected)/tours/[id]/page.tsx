/**
 * TOUR DETAIL (admin) — the full editing surface of one tour: the main
 * form, the publish toggle, the day-by-day itinerary manager, the
 * scheduled-departure manager, and the destructive delete (staff can
 * delete content rows per RLS).
 */
import { notFound } from "next/navigation";
import {
  getStaffDepartures,
  getStaffDestinations,
  getStaffItinerary,
  getStaffTourById,
} from "@/lib/queries/admin";
import { deleteTour, setTourPublished } from "@/lib/actions/tours";
import { DeleteForm, TogglePublished } from "@/components/admin/Controls";
import { TourForm } from "@/components/admin/forms/TourForm";
import { DepartureManager } from "@/components/admin/forms/DepartureManager";
import { ItineraryManager } from "@/components/admin/forms/ItineraryManager";
import { AdminPageHeader } from "@/components/admin/AdminBits";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const tour = await getStaffTourById(id);
  return { title: tour ? tour.title_fr : "Circuit introuvable" };
}

export default async function AdminTourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [tour, destinations, itinerary, departures] = await Promise.all([
    getStaffTourById(id),
    getStaffDestinations(),
    getStaffItinerary(id),
    getStaffDepartures(id),
  ]);

  if (!tour) notFound();

  return (
    <div>
      <AdminPageHeader
        title={tour.title_fr}
        description={tour.is_published ? "Circuit publié." : "Brouillon — invisible sur le site."}
        action={
          <div className="flex items-center gap-3">
            <TogglePublished
              id={tour.id}
              isPublished={tour.is_published}
              action={setTourPublished}
              labels={{ publish: "Publier", unpublish: "Dépublier" }}
            />
            <DeleteForm
              id={tour.id}
              action={deleteTour}
              label="Supprimer le circuit"
              confirmText="Supprimer ce circuit ? Ses départs et son programme seront également supprimés."
            />
          </div>
        }
      />

      <TourForm
        tour={tour}
        destinations={destinations.map((destination) => ({
          id: destination.id,
          name: destination.name_fr,
        }))}
      />

      <section aria-labelledby="tour-itinerary" className="mt-12">
        <h2 id="tour-itinerary" className="mb-4 font-display text-xl text-ink">
          Programme jour par jour
        </h2>
        <ItineraryManager tourId={tour.id} itinerary={itinerary} />
      </section>

      <section aria-labelledby="tour-departures" className="mt-12">
        <h2 id="tour-departures" className="mb-4 font-display text-xl text-ink">
          Départs planifiés
        </h2>
        <DepartureManager tourId={tour.id} departures={departures} />
      </section>
    </div>
  );
}