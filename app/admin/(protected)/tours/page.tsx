/**
 * TOURS ADMIN — list of every tour (drafts included, RLS allows staff),
 * with publish toggles and links to the detail/edit page.
 */
import Link from "next/link";
import { getStaffTours } from "@/lib/queries/admin";
import { setTourPublished } from "@/lib/actions/tours";
import { TogglePublished } from "@/components/admin/Controls";
import { AdminEmptyState, AdminPageHeader, formatDateFr } from "@/components/admin/AdminBits";

export const metadata = { title: "Circuits" };

export default async function AdminToursPage() {
  const tours = await getStaffTours();

  return (
    <div>
      <AdminPageHeader
        title="Circuits"
        description={`${tours.length} circuit(s) — brouillons compris.`}
        action={
          <Link
            href="/admin/tours/new"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            + Nouveau circuit
          </Link>
        }
      />

      {tours.length === 0 ? (
        <AdminEmptyState
          title="Aucun circuit pour le moment."
          hint="Créez votre premier circuit pour qu'il apparaisse sur le site."
        />
      ) : (
        <ul className="space-y-3">
          {tours.map((tour) => (
            <li
              key={tour.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border bg-surface p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/tours/${tour.id}`}
                    className="truncate font-medium text-ink hover:text-primary"
                  >
                    {tour.title_fr}
                  </Link>
                  {tour.is_featured ? (
                    <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-ink">
                      En vedette
                    </span>
                  ) : null}
                  {!tour.is_published ? (
                    <span className="rounded-full bg-muted/15 px-2 py-0.5 text-xs font-medium text-muted">
                      Brouillon
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted">
                  {tour.slug} · {tour.duration_days} jour(s) · {tour.price_mad} MAD · modifié le{" "}
                  {formatDateFr(tour.updated_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TogglePublished
                  id={tour.id}
                  isPublished={tour.is_published}
                  action={setTourPublished}
                  labels={{ publish: "Publier", unpublish: "Dépublier" }}
                />
                <Link
                  href={`/admin/tours/${tour.id}`}
                  className="text-sm font-medium text-secondary underline"
                >
                  Modifier
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}