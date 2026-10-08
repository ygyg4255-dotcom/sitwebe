/**
 * Tour preview card — used on the homepage and the tours list.
 * Links to the individual tour detail page. Title, summary and price are
 * locale-aware with a French fallback (lib/i18n/content.ts).
 */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { localizedText } from "@/lib/i18n/content";
import { formatPrice } from "@/lib/format";
import type { TourRow } from "@/lib/queries/tours";
import { Badge } from "@/components/ui/Badge";
import { PhotoPlaceholder, photoVariantFor } from "@/components/ui/PhotoPlaceholder";

interface TourCardProps {
  locale: Locale;
  tour: TourRow;
  labels: Dictionary["common"];
}

export function TourCard({ locale, tour, labels }: TourCardProps) {
  const title = localizedText(
    locale,
    tour.title_fr,
    tour.title_en,
    tour.title_ar
  );
  const summary = localizedText(
    locale,
    tour.summary_fr,
    tour.summary_en,
    tour.summary_ar
  );
  const difficultyLabel =
    labels.difficulty[tour.difficulty as keyof typeof labels.difficulty] ??
    tour.difficulty;

  return (
    <Link
      href={`/${locale}/tours/${tour.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      <PhotoPlaceholder
        variant={photoVariantFor(tour.slug)}
        className="aspect-[16/10] w-full"
      />

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl text-ink transition-colors group-hover:text-primary">
          {title}
        </h3>
        {summary ? (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">{summary}</p>
        ) : null}

        {/* Meta: duration, group size, difficulty */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">
            {tour.duration_days}{" "}
            {tour.duration_days === 1 ? labels.day : labels.days}
          </Badge>
          {tour.group_size_max ? (
            <Badge variant="outline">
              {tour.group_size_max} {labels.maxPeople}
            </Badge>
          ) : null}
          <Badge variant="accent">{difficultyLabel}</Badge>
        </div>

        {/* Price row — pushed to the bottom so every card aligns */}
        <div className="mt-5 flex items-center justify-between border-t border-brand-border pt-4">
          <p className="text-sm text-muted">
            {labels.from}{" "}
            <span className="font-display text-xl text-ink">
              {formatPrice(tour.price_mad, locale)}
            </span>{" "}
            {labels.currency} {labels.perPerson}
          </p>
          <span
            aria-hidden="true"
            className="text-primary transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}