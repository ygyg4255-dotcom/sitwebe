/**
 * Destination card — links to the destination detail page. Name and
 * description are locale-aware with a French fallback. `tourCount` is
 * computed by the caller (published tours grouped by destination).
 */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { localizedText } from "@/lib/i18n/content";
import type { DestinationRow } from "@/lib/queries/destinations";
import { PhotoPlaceholder, photoVariantFor } from "@/components/ui/PhotoPlaceholder";

interface DestinationCardProps {
  locale: Locale;
  destination: DestinationRow;
  /** Published tours that depart into this destination (for the count chip). */
  tourCount: number;
  tourCountLabel: Dictionary["home"]["destinations"]["tourCountLabel"];
}

export function DestinationCard({
  locale,
  destination,
  tourCount,
  tourCountLabel,
}: DestinationCardProps) {
  const name = localizedText(
    locale,
    destination.name_fr,
    destination.name_en,
    destination.name_ar
  );

  return (
    <Link
      href={`/${locale}/destinations/${destination.slug}`}
      className="group overflow-hidden rounded-2xl border border-brand-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative">
        <PhotoPlaceholder
          variant={photoVariantFor(destination.slug)}
          className="aspect-[16/9] w-full"
        />
        <p className="absolute top-3 end-3 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {tourCountLabel.replace("{count}", String(tourCount))}
        </p>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg text-ink transition-colors group-hover:text-primary">
          {name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">
          {localizedText(
            locale,
            destination.description_fr,
            destination.description_en,
            destination.description_ar
          )}
        </p>
      </div>
    </Link>
  );
}