/** TESTIMONIAL DETAIL (admin) — edit form for one client review. */
import { notFound } from "next/navigation";
import { getStaffTestimonialById } from "@/lib/queries/admin";
import { TestimonialForm } from "@/components/admin/forms/TestimonialForm";
import { AdminPageHeader } from "@/components/admin/AdminBits";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const testimonial = await getStaffTestimonialById(id);
  return { title: testimonial ? testimonial.author_name : "Avis introuvable" };
}

export default async function AdminTestimonialDetailPage({ params }: PageProps) {
  const { id } = await params;
  const testimonial = await getStaffTestimonialById(id);

  if (!testimonial) notFound();

  return (
    <div>
      <AdminPageHeader
        title={testimonial.author_name}
        description={testimonial.is_published ? "Avis publié." : "Brouillon — invisible sur le site."}
      />
      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}