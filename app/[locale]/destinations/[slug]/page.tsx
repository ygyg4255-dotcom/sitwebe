/**
 * Destination detail — one published destination: description, photo mood
 * and the published tours that visit it. Unknown slugs render on demand
 * and 404.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedText } from "@/lib/i18n/content";
import {
  getPublishedDestinationBySlug,
  getPublishedDestinations,
} from "@/lib/queries/destinations";
import { getPublishedTours } from "@/lib/queries/tours";
import { localeAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoPlaceholder, photoVariantFor } from "@/components/ui/PhotoPlaceholder";
import { TourCard } from "@/components/tours/TourCard";

interface DestinationPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/** Pre-render every published destination × locale at build time. */
export async function generateStaticParams() {
  const destinations = await getPublishedDestinations();
  if (destinations.length === 0) {
    // Cache Components requires at least one param (see notFound below).
    return [{ slug: "__placeholder__" }];
  }
  return destinations.map((destination) => ({ slug: destination.slug }));
}

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const destination = await getPublishedDestinationBySlug(slug);

  if (!destination) {
    return {
      title: dict.pages.destinations.title,
      description: dict.pages.destinations.subtitle,
    };
  }

  const title = localizedText(
    locale,
    destination.name_fr,
    destination.name_en,
    destination.name_ar
  );
  const description = localizedText(
    locale,
    destination.description_fr,
    destination.description_en,
    destination.description_ar
  );

  return {
    title,
    description,
    alternates: localeAlternates(locale, `/destinations/${slug}`),
    openGraph: {
      type: "article",
      title,
      description,
      url: `/${locale}/destinations/${slug}`,
    },
  };
}

export default async function DestinationDetailPage({
  params,
}: DestinationPageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const destination = await getPublishedDestinationBySlug(slug);
  if (!destination) notFound();

  const tours = await getPublishedTours();
  const destinationTours = tours.filter(
    (tour) => tour.destination_id === destination.id
  );

  const name = localizedText(
    locale,
    destination.name_fr,
    destination.name_en,
    destination.name_ar
  );
  const description = localizedText(
    locale,
    destination.description_fr,
    destination.description_en,
    destination.description_ar
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-linear-to-b from-sand to-paper">
        <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2">
          <div>
            <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
              {name}
            </h1>
            {description ? (
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
                {description}
              </p>
            ) : null}
            <Link
              href={`/${locale}/destinations`}
              className="mt-6 inline-block text-sm font-medium text-primary hover:text-primary-dark"
            >
              <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
                ←{" "}
              </span>
              {dict.destinationDetail.backToDestinations}
            </Link>
          </div>
          <PhotoPlaceholder
            variant={photoVariantFor(destination.slug)}
            label={name}
            className="aspect-[4/3] w-full rounded-3xl shadow-lg"
          />
        </Container>
      </section>

      {/* Tours in this destination */}
      <Container className="py-14">
        <SectionHeading
          title={dict.destinationDetail.toursTitle}
          align="start"
        />
        {destinationTours.length === 0 ? (
          <p className="mt-8 text-muted">{dict.destinationDetail.noTours}</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinationTours.map((tour) => (
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
    </>
  );
}