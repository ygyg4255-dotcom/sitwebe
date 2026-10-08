/**
 * Gallery — a visual overview of the published destinations and tours.
 * The seed has no photography yet, so visuals are the decorative
 * PhotoPlaceholder scenes (they switch to real Supabase Storage images
 * once `image_url` / `cover_image_url` columns are filled — Phase 4).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedText } from "@/lib/i18n/content";
import { getPublishedDestinations } from "@/lib/queries/destinations";
import { getPublishedTours } from "@/lib/queries/tours";
import { localeAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoPlaceholder, photoVariantFor } from "@/components/ui/PhotoPlaceholder";

interface GalleryPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: GalleryPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: dict.pages.gallery.title,
    description: dict.pages.gallery.subtitle,
    alternates: localeAlternates(locale, "/gallery"),
    openGraph: {
      title: dict.pages.gallery.title,
      description: dict.pages.gallery.subtitle,
      url: `/${locale}/gallery`,
    },
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const [destinations, tours] = await Promise.all([
    getPublishedDestinations(),
    getPublishedTours(),
  ]);

  const destinationItems = destinations.map((destination) => ({
    key: destination.id,
    slug: destination.slug,
    label: localizedText(
      locale,
      destination.name_fr,
      destination.name_en,
      destination.name_ar
    ),
  }));

  const tourItems = tours.map((tour) => ({
    key: tour.id,
    slug: tour.slug,
    label: localizedText(locale, tour.title_fr, tour.title_en, tour.title_ar),
  }));

  const isEmpty = destinationItems.length === 0 && tourItems.length === 0;

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        title={dict.pages.gallery.title}
        subtitle={dict.pages.gallery.subtitle}
      />

      {isEmpty ? (
        <p className="mt-10 text-center text-muted">{dict.pages.gallery.empty}</p>
      ) : (
        <>
          {destinationItems.length > 0 ? (
            <section className="mt-12">
              <h2 className="font-display text-2xl text-ink">
                {dict.pages.gallery.destinationsLabel}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {destinationItems.map((item) => (
                  <PhotoPlaceholder
                    key={item.key}
                    variant={photoVariantFor(item.slug)}
                    label={item.label}
                    className="aspect-[4/3] w-full rounded-2xl shadow-sm"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {tourItems.length > 0 ? (
            <section className="mt-14">
              <h2 className="font-display text-2xl text-ink">
                {dict.pages.gallery.toursLabel}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tourItems.map((item) => (
                  <PhotoPlaceholder
                    key={item.key}
                    variant={photoVariantFor(item.slug)}
                    label={item.label}
                    className="aspect-[16/10] w-full rounded-2xl shadow-sm"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </Container>
  );
}