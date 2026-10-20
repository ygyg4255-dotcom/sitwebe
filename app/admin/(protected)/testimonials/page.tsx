/**
 * TESTIMONIALS ADMIN — list with publish toggles and delete, plus links
 * to the edit page.
 */
import Link from "next/link";
import { getStaffTestimonials } from "@/lib/queries/admin";
import { deleteTestimonial, setTestimonialPublished } from "@/lib/actions/testimonials";
import { DeleteForm, TogglePublished } from "@/components/admin/Controls";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin/AdminBits";

export const metadata = { title: "Avis clients" };

export default async function AdminTestimonialsPage() {
  const testimonials = await getStaffTestimonials();

  return (
    <div>
      <AdminPageHeader
        title="Avis clients"
        description={`${testimonials.length} avis — brouillons compris.`}
        action={
          <Link
            href="/admin/testimonials/new"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            + Nouvel avis
          </Link>
        }
      />

      {testimonials.length === 0 ? (
        <AdminEmptyState
          title="Aucun avis pour le moment."
          hint="Ajoutez les retours de vos voyageurs pour rassurer les futurs clients."
        />
      ) : (
        <ul className="space-y-3">
          {testimonials.map((testimonial) => (
            <li
              key={testimonial.id}
              className="rounded-2xl border border-brand-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/testimonials/${testimonial.id}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {testimonial.author_name}
                    </Link>
                    <span className="text-sm text-secondary" aria-label={`${testimonial.rating} sur 5 étoiles`}>
                      {"★".repeat(testimonial.rating)}
                    </span>
                    {testimonial.author_country ? (
                      <span className="text-xs text-muted">{testimonial.author_country}</span>
                    ) : null}
                    {!testimonial.is_published ? (
                      <span className="rounded-full bg-muted/15 px-2 py-0.5 text-xs font-medium text-muted">
                        Brouillon
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{testimonial.quote_fr}</p>
                </div>
                <div className="flex items-center gap-2">
                  <TogglePublished
                    id={testimonial.id}
                    isPublished={testimonial.is_published}
                    action={setTestimonialPublished}
                    labels={{ publish: "Publier", unpublish: "Dépublier" }}
                  />
                  <DeleteForm
                    id={testimonial.id}
                    action={deleteTestimonial}
                    label="Supprimer"
                    confirmText="Supprimer cet avis client ?"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}