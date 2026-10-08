/**
 * Tours catalog — every published tour from Supabase (the RLS-filtered
 * public query). Empty state when the agency has not published any tour.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPublishedTours } from "@/lib/queries/tours";
import { localeAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TourCard } from "@/components/tours/TourCard";

interface ToursPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ToursPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: dict.pages.tours.title,
    description: dict.pages.tours.subtitle,
    alternates: localeAlternates(locale, "/tours"),
    openGraph: {
      title: dict.pages.tours.title,
      description: dict.pages.tours.subtitle,
      url: `/${locale}/tours`,
    },
  };
}

export default async function ToursPage({ params }: ToursPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const tours = await getPublishedTours();

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        title={dict.pages.tours.title}
        subtitle={dict.pages.tours.subtitle}
      />

      {tours.length === 0 ? (
        <p className="mt-10 text-center text-muted">{dict.pages.tours.empty}</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              locale={locale}
              tour={tour}
              labels={dict.common}
            />
          ))}
        </div>
      )}
    </Container>
  );
}