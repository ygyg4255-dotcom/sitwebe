/**
 * FAQ ADMIN — list ordered by display order, with publish toggles,
 * delete, and links to the edit page.
 */
import Link from "next/link";
import { getStaffFaqs } from "@/lib/queries/admin";
import { deleteFaq, setFaqPublished } from "@/lib/actions/faqs";
import { DeleteForm, TogglePublished } from "@/components/admin/Controls";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin/AdminBits";

export const metadata = { title: "FAQ" };

export default async function AdminFaqsPage() {
  const faqs = await getStaffFaqs();

  return (
    <div>
      <AdminPageHeader
        title="FAQ"
        description={`${faqs.length} question(s) — brouillons compris.`}
        action={
          <Link
            href="/admin/faqs/new"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            + Nouvelle question
          </Link>
        }
      />

      {faqs.length === 0 ? (
        <AdminEmptyState
          title="Aucune question pour le moment."
          hint="Anticipez les questions fréquentes : visas, paiement, bagages…"
        />
      ) : (
        <ul className="space-y-3">
          {faqs.map((faq) => (
            <li
              key={faq.id}
              className="rounded-2xl border border-brand-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted">#{faq.sort_order}</span>
                    <Link
                      href={`/admin/faqs/${faq.id}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {faq.question_fr}
                    </Link>
                    {!faq.is_published ? (
                      <span className="rounded-full bg-muted/15 px-2 py-0.5 text-xs font-medium text-muted">
                        Brouillon
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{faq.answer_fr}</p>
                </div>
                <div className="flex items-center gap-2">
                  <TogglePublished
                    id={faq.id}
                    isPublished={faq.is_published}
                    action={setFaqPublished}
                    labels={{ publish: "Publier", unpublish: "Dépublier" }}
                  />
                  <DeleteForm
                    id={faq.id}
                    action={deleteFaq}
                    label="Supprimer"
                    confirmText="Supprimer cette question ?"
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