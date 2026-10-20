/** NEW DESTINATION — creation form (redirects to the list on success). */
import { DestinationForm } from "@/components/admin/forms/DestinationForm";
import { AdminPageHeader } from "@/components/admin/AdminBits";

export const metadata = { title: "Nouvelle destination" };

export default function NewDestinationPage() {
  return (
    <div>
      <AdminPageHeader
        title="Nouvelle destination"
        description="Une région ou une ville mise en avant sur le site."
      />
      <DestinationForm />
    </div>
  );
}