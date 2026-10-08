/**
 * Tour preview card used on the homepage (and the tours list in Phase 3).
 * The whole card links to the tours page — in Phase 3 it links to the
 * individual tour detail page (`/${locale}/tours/${tour.slug}`).
 */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import type { DemoTour } from "@/lib/demo/content";
import { Badge } from "@/components/ui/Badge";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";

interface TourCardProps {
  locale: Locale;
  tour: DemoTour;
  labels: Dictionary["common"];
}

export function TourCard({ locale, tour, labels }: TourCardProps) {
  return (
    <Link
      href={`/${locale}/tours`}
      className="group block overflow-hidden rounded-2xl border border-brand-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      <PhotoPlaceholder
        variant={tour.photo}
        className="aspect-[16/10] w-full"
      />

      <div className="p-5">
        <h3 className="font-display text-xl text-ink transition-colors group-hover:text-primary">
          {tour.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{tour.summary}</p>

        {/* Meta: duration, group size, difficulty */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">
            {tour.durationDays} {labels.days}
          </Badge>
          <Badge variant="outline">
            {tour.groupSizeMax} {labels.maxPeople}
          </Badge>
          <Badge variant="accent">{labels.difficulty[tour.difficulty]}</Badge>
        </div>

        {/* Price row */}
        <div className="mt-4 flex items-center justify-between border-t border-brand-border pt-4">
          <p className="text-sm text-muted">
            {labels.from}{" "}
            <span className="font-display text-xl text-ink">
              {tour.priceFrom.toLocaleString("fr-FR")}
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