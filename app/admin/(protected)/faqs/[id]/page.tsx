/** FAQ DETAIL (admin) — edit form for one question. */
import { notFound } from "next/navigation";
import { getStaffFaqById } from "@/lib/queries/admin";
import { FaqForm } from "@/components/admin/forms/FaqForm";
import { AdminPageHeader } from "@/components/admin/AdminBits";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const faq = await getStaffFaqById(id);
  return { title: faq ? faq.question_fr : "Question introuvable" };
}

export default async function AdminFaqDetailPage({ params }: PageProps) {
  const { id } = await params;
  const faq = await getStaffFaqById(id);

  if (!faq) notFound();

  return (
    <div>
      <AdminPageHeader
        title={faq.question_fr}
        description={faq.is_published ? "Question publiée." : "Brouillon — invisible sur le site."}
      />
      <FaqForm faq={faq} />
    </div>
  );
}