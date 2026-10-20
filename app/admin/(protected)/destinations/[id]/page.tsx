/**
 * DESTINATION DETAIL (admin) — edit form for one destination. Tours
 * linked to it are managed from the tours pages.
 */
import { notFound } from "next/navigation";
import { getStaffDestinationById } from "@/lib/queries/admin";
import { DestinationForm } from "@/components/admin/forms/DestinationForm";
import { AdminPageHeader } from "@/components/admin/AdminBits";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const destination = await getStaffDestinationById(id);
  return { title: destination ? destination.name_fr : "Destination introuvable" };
}

export default async function AdminDestinationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const destination = await getStaffDestinationById(id);

  if (!destination) notFound();

  return (
    <div>
      <AdminPageHeader
        title={destination.name_fr}
        description={destination.is_published ? "Destination publiée." : "Brouillon — invisible sur le site."}
      />
      <DestinationForm destination={destination} />
    </div>
  );
}