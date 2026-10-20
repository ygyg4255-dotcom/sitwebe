/** NEW TESTIMONIAL — creation form (redirects to the list on success). */
import { TestimonialForm } from "@/components/admin/forms/TestimonialForm";
import { AdminPageHeader } from "@/components/admin/AdminBits";

export const metadata = { title: "Nouvel avis" };

export default function NewTestimonialPage() {
  return (
    <div>
      <AdminPageHeader
        title="Nouvel avis client"
        description="Le texte français est obligatoire ; les traductions sont facultatives."
      />
      <TestimonialForm />
    </div>
  );
}