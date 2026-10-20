/** NEW FAQ — creation form (redirects to the list on success). */
import { FaqForm } from "@/components/admin/forms/FaqForm";
import { AdminPageHeader } from "@/components/admin/AdminBits";

export const metadata = { title: "Nouvelle question" };

export default function NewFaqPage() {
  return (
    <div>
      <AdminPageHeader
        title="Nouvelle question"
        description="La question et la réponse françaises sont obligatoires."
      />
      <FaqForm />
    </div>
  );
}