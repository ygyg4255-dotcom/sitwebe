/**
 * "Popular tours" section — published + featured tours from Supabase
 * (cached query, tag "tours"). Renders nothing when the database has no
 * featured tour yet (graceful empty state for the homepage).
 */
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { getFeaturedTours } from "@/lib/queries/tours";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { TourCard } from "@/components/tours/TourCard";

interface FeaturedToursProps {
  locale: Locale;
  dict: Dictionary;
}

export async function FeaturedTours({ locale, dict }: FeaturedToursProps) {
  const content = dict.home.featured;
  const tours = await getFeaturedTours(3);

  if (tours.length === 0) return null;

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow={content.eyebrow}
        title={content.title}
        subtitle={content.subtitle}
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tours.map((tour) => (
          <TourCard
            key={tour.id}
            locale={locale}
            tour={tour}
            labels={dict.common}
          />
        ))}
      </div>

      <div className="mt-10 text-center">
        <ButtonLink href={`/${locale}/tours`} variant="outline">
          {content.cta}
        </ButtonLink>
      </div>
    </Container>
  );
}