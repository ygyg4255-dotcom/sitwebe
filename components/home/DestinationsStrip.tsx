/**
 * Destinations grid — published destinations from Supabase (cached query,
 * tag "destinations"). Each card links to its destination detail page;
 * the tour count is derived from the published tours query.
 * Renders nothing when the database has no destination yet.
 */
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { getPublishedDestinations } from "@/lib/queries/destinations";
import { getPublishedTours } from "@/lib/queries/tours";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DestinationCard } from "@/components/destinations/DestinationCard";

interface DestinationsStripProps {
  locale: Locale;
  content: Dictionary["home"]["destinations"];
}

export async function DestinationsStrip({
  locale,
  content,
}: DestinationsStripProps) {
  const [destinations, tours] = await Promise.all([
    getPublishedDestinations(),
    getPublishedTours(),
  ]);

  if (destinations.length === 0) return null;

  const tourCountByDestination = new Map<string, number>();
  for (const tour of tours) {
    if (!tour.destination_id) continue;
    tourCountByDestination.set(
      tour.destination_id,
      (tourCountByDestination.get(tour.destination_id) ?? 0) + 1
    );
  }

  return (
    <section className="bg-sand/50">
      <Container className="py-16 sm:py-20">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          subtitle={content.subtitle}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              locale={locale}
              destination={destination}
              tourCount={tourCountByDestination.get(destination.id) ?? 0}
              tourCountLabel={content.tourCountLabel}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}