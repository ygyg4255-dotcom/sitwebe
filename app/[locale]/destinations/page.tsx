/**
 * Destinations — every published destination from Supabase, each card
 * linking to its detail page with the number of published tours.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPublishedDestinations } from "@/lib/queries/destinations";
import { getPublishedTours } from "@/lib/queries/tours";
import { localeAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DestinationCard } from "@/components/destinations/DestinationCard";

interface DestinationsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: DestinationsPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: dict.pages.destinations.title,
    description: dict.pages.destinations.subtitle,
    alternates: localeAlternates(locale, "/destinations"),
    openGraph: {
      title: dict.pages.destinations.title,
      description: dict.pages.destinations.subtitle,
      url: `/${locale}/destinations`,
    },
  };
}

export default async function DestinationsPage({ params }: DestinationsPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const [destinations, tours] = await Promise.all([
    getPublishedDestinations(),
    getPublishedTours(),
  ]);

  const tourCountByDestination = new Map<string, number>();
  for (const tour of tours) {
    if (!tour.destination_id) continue;
    tourCountByDestination.set(
      tour.destination_id,
      (tourCountByDestination.get(tour.destination_id) ?? 0) + 1
    );
  }

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        title={dict.pages.destinations.title}
        subtitle={dict.pages.destinations.subtitle}
      />

      {destinations.length === 0 ? (
        <p className="mt-10 text-center text-muted">
          {dict.pages.destinations.empty}
        </p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              locale={locale}
              destination={destination}
              tourCount={tourCountByDestination.get(destination.id) ?? 0}
              tourCountLabel={dict.home.destinations.tourCountLabel}
            />
          ))}
        </div>
      )}
    </Container>
  );
}