/**
 * Tour detail — the full presentation of one published tour: hero,
 * description, what's included, day-by-day itinerary, scheduled
 * departures and the booking request form. The form posts a
 * validated booking request; the WhatsApp CTA remains as an instant
 * contact channel.
 *
 * Prerendered at build time for every seeded locale × tour pair
 * (generateStaticParams); unknown slugs render on demand and 404.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedText } from "@/lib/i18n/content";
import { formatDate, formatPrice } from "@/lib/format";
import {
  getDepartures,
  getItinerary,
  getPublishedTourBySlug,
  getPublishedTours,
} from "@/lib/queries/tours";
import { getBranding, getSiteUrl } from "@/lib/config/site";
import { getCachedToday, localeAlternates, tourJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PhotoPlaceholder, photoVariantFor } from "@/components/ui/PhotoPlaceholder";
import { TourCard } from "@/components/tours/TourCard";
import { BookingForm, type DepartureOption } from "@/components/forms/BookingForm";

interface TourPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/** Pre-render every published tour × locale at build time. */
export async function generateStaticParams() {
  const tours = await getPublishedTours();
  if (tours.length === 0) {
    // Cache Components requires at least one param — a placeholder slug
    // keeps the build valid; the page 404s it (see notFound below).
    return [{ slug: "__placeholder__" }];
  }
  // Called once per parent locale param; content is locale-independent
  // here (the page itself resolves per-locale text).
  return tours.map((tour) => ({ slug: tour.slug }));
}

export async function generateMetadata({
  params,
}: TourPageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const tour = await getPublishedTourBySlug(slug);

  if (!tour) {
    return {
      title: dict.pages.tours.title,
      description: dict.pages.tours.subtitle,
    };
  }

  const title = localizedText(
    locale,
    tour.title_fr,
    tour.title_en,
    tour.title_ar
  );
  const description = localizedText(
    locale,
    tour.summary_fr,
    tour.summary_en,
    tour.summary_ar
  );

  return {
    title,
    description,
    alternates: localeAlternates(locale, `/tours/${slug}`),
    openGraph: {
      type: "article",
      title,
      description,
      url: `/${locale}/tours/${slug}`,
    },
  };
}

export default async function TourDetailPage({ params }: TourPageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const labels = dict.common;

  const tour = await getPublishedTourBySlug(slug);
  if (!tour) notFound();

  const branding = await getBranding();
  const [itinerary, allDepartures, otherTours, today] = await Promise.all([
    getItinerary(tour.id),
    getDepartures(tour.id),
    getPublishedTours(),
    getCachedToday(),
  ]);

  const departures = allDepartures.filter((d) => d.start_date >= today);
  const suggestions = otherTours
    .filter((other) => other.id !== tour.id)
    .slice(0, 3);

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
  const description = localizedText(
    locale,
    tour.description_fr,
    tour.description_en,
    tour.description_ar
  );
  const difficultyLabel =
    labels.difficulty[tour.difficulty as keyof typeof labels.difficulty] ??
    tour.difficulty;
  const detail = dict.tourDetail;

  const whatsappHref = `https://wa.me/${branding.contact.whatsapp}?text=${encodeURIComponent(title)}`;

  // Booking form labels (forms dictionary block + shared "submitting").
  const bookingLabels = {
    ...dict.forms.booking,
    submitting: dict.forms.submitting,
  };

  // Preformatted departure options for the booking form's <select>.
  const departureOptions: DepartureOption[] = departures.map((departure) => {
    const seatsLeft = departure.max_participants
      ? departure.max_participants - departure.booked_participants
      : null;
    const label = `${formatDate(departure.start_date, locale)} — ${formatDate(
      departure.end_date,
      locale
    )} · ${formatPrice(departure.price_mad ?? tour.price_mad, locale)}`;
    return {
      id: departure.id,
      label: seatsLeft !== null ? `${label} · ${seatsLeft} ${labels.seatsLeft}` : label,
    };
  });

  return (
    <>
      <JsonLd
        data={tourJsonLd(tour, itinerary, locale, getSiteUrl())}
      />

      {/* Hero: scene + title + key facts + price */}
      <section className="bg-linear-to-b from-sand to-paper">
        <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap gap-2">
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
            <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {summary ? (
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
                {summary}
              </p>
            ) : null}
            <p className="mt-6 text-sm text-muted">
              {labels.from}{" "}
              <span className="font-display text-3xl text-primary">
                {formatPrice(tour.price_mad, locale)}
              </span>{" "}
              {labels.currency} {labels.perPerson}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#book" size="lg">
                {detail.bookCta}
              </ButtonLink>
              <ButtonLink
                href={`/${locale}/contact`}
                variant="outline"
                size="lg"
              >
                {detail.askCta}
              </ButtonLink>
            </div>
          </div>
          <PhotoPlaceholder
            variant={photoVariantFor(tour.slug)}
            className="aspect-[4/3] w-full rounded-3xl shadow-lg"
          />
        </Container>
      </section>

      {/* Description + included/excluded */}
      <Container className="grid gap-10 py-14 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {description ? (
            <p className="text-lg leading-relaxed text-ink/85">{description}</p>
          ) : null}

          {tour.departure_location || tour.return_location ? (
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {tour.departure_location ? (
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wide text-primary">
                    {detail.departurePoint}
                  </dt>
                  <dd className="mt-1 text-ink/85">{tour.departure_location}</dd>
                </div>
              ) : null}
              {tour.return_location ? (
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wide text-primary">
                    {detail.returnPoint}
                  </dt>
                  <dd className="mt-1 text-ink/85">{tour.return_location}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {/* Itinerary */}
          {itinerary.length > 0 ? (
            <section aria-labelledby="itinerary" className="mt-12">
              <h2
                id="itinerary"
                className="font-display text-2xl text-ink sm:text-3xl"
              >
                {detail.itineraryTitle}
              </h2>
              <ol className="mt-6 space-y-6">
                {itinerary.map((day) => (
                  <li key={day.id} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm text-white"
                    >
                      {day.day_number}
                    </span>
                    <div>
                      <h3 className="font-display text-lg text-ink">
                        {detail.dayLabel} {day.day_number} —{" "}
                        {localizedText(
                          locale,
                          day.title_fr,
                          day.title_en,
                          day.title_ar
                        )}
                      </h3>
                      <p className="mt-1 leading-relaxed text-muted">
                        {localizedText(
                          locale,
                          day.description_fr,
                          day.description_en,
                          day.description_ar
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>

        {/* Sidebar: included / excluded / departures */}
        <div className="space-y-6">
          {tour.included.length > 0 ? (
            <Card className="p-6">
              <h2 className="font-display text-lg text-ink">
                {detail.includedTitle}
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-ink/85">
                {tour.included.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-secondary">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {tour.excluded.length > 0 ? (
            <Card className="p-6">
              <h2 className="font-display text-lg text-ink">
                {detail.excludedTitle}
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {tour.excluded.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card className="p-6">
            <h2 className="font-display text-lg text-ink">
              {detail.departuresTitle}
            </h2>
            {departures.length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {detail.noDepartures}
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {departures.map((departure) => {
                  const seatsLeft = departure.max_participants
                    ? departure.max_participants - departure.booked_participants
                    : null;
                  return (
                    <li
                      key={departure.id}
                      className="rounded-xl border border-brand-border p-4 text-sm"
                    >
                      <dl className="space-y-1">
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted">{detail.departureLabel}</dt>
                          <dd className="font-medium text-ink">
                            <time dateTime={departure.start_date}>
                              {formatDate(departure.start_date, locale)}
                            </time>
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted">{detail.returnLabel}</dt>
                          <dd className="font-medium text-ink">
                            <time dateTime={departure.end_date}>
                              {formatDate(departure.end_date, locale)}
                            </time>
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted">{labels.currency}</dt>
                          <dd className="font-medium text-ink">
                            {formatPrice(
                              departure.price_mad ?? tour.price_mad,
                              locale
                            )}
                          </dd>
                        </div>
                      </dl>
                      {seatsLeft !== null ? (
                        <p className="mt-2 text-xs font-medium text-secondary">
                          {seatsLeft} {labels.seatsLeft}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </Container>

      {/* Booking request form (anchor target of the hero CTA) */}
      <section id="book" aria-labelledby="book-title" className="bg-sand/50">
        <Container className="py-16">
          <SectionHeading
            title={bookingLabels.title}
            subtitle={bookingLabels.subtitle}
          />
          <div className="mx-auto mt-10 max-w-2xl">
            <BookingForm
              tourId={tour.id}
              departures={departureOptions}
              labels={bookingLabels}
            />
            <p className="mt-4 text-center text-sm text-muted">
              {detail.whatsappOr}{" "}
              <a
                href={whatsappHref}
                className="font-medium text-secondary underline"
              >
                WhatsApp
              </a>
            </p>
          </div>
        </Container>
      </section>

      {/* Other tours */}
      {suggestions.length > 0 ? (
        <section className="bg-sand/50">
          <Container className="py-16">
            <SectionHeading title={detail.otherTours} />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {suggestions.map((other) => (
                <TourCard
                  key={other.id}
                  locale={locale}
                  tour={other}
                  labels={labels}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}