/**
 * NEW TOUR — creation form. On success the createTour action redirects
 * to the tours list; the created tour can then be opened to manage its
 * itinerary and departures.
 */
import { getStaffDestinations } from "@/lib/queries/admin";
import { TourForm } from "@/components/admin/forms/TourForm";
import { AdminPageHeader } from "@/components/admin/AdminBits";

export const metadata = { title: "Nouveau circuit" };

export default async function NewTourPage() {
  const destinations = await getStaffDestinations();

  return (
    <div>
      <AdminPageHeader
        title="Nouveau circuit"
        description="Créez le circuit, puis gérez son programme et ses départs depuis sa fiche."
      />
      <TourForm
        destinations={destinations.map((destination) => ({
          id: destination.id,
          name: destination.name_fr,
        }))}
      />
    </div>
  );
}