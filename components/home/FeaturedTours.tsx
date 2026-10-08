/**
 * "Popular tours" section — three demo tour cards.
 * Phase 3 replaces the demo data with published tours from Supabase.
 */
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { demoTours } from "@/lib/demo/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { TourCard } from "@/components/tours/TourCard";

interface FeaturedToursProps {
  locale: Locale;
  dict: Dictionary;
}

export function FeaturedTours({ locale, dict }: FeaturedToursProps) {
  const content = dict.home.featured;

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow={content.eyebrow}
        title={content.title}
        subtitle={content.subtitle}
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {demoTours.map((tour) => (
          <TourCard
            key={tour.slug}
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