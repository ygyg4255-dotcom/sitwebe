/**
 * SEO helpers — canonical/hreflang alternates, the build-time "today"
 * snapshot, and JSON-LD (structured data) builders.
 *
 * JSON-LD objects are rendered by <JsonLd> (components/seo/JsonLd.tsx),
 * which serializes them safely. Builders take plain rows from the typed
 * queries — no fetches happen here.
 */
import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { localizedText } from "@/lib/i18n/content";
import type { SiteBranding } from "@/lib/config/site";
import type { TableRow } from "@/lib/types/database";

type TourRow = TableRow<"tours">;
type ItineraryRow = TableRow<"tour_itinerary">;
type BlogPostRow = TableRow<"blog_posts">;
type FaqRow = TableRow<"faqs">;

/**
 * Builds the `alternates` metadata for a locale-prefixed page:
 * the canonical URL plus hreflang links for every supported locale
 * (with `x-default` pointing at the French reference).
 *
 * `path` is the part AFTER the locale prefix, e.g. "/tours" or
 * "/tours/sahara-merzouga-3-jours". Values are relative — `metadataBase`
 * (set in the locale layout) resolves them to absolute URLs.
 */
export function localeAlternates(
  locale: Locale,
  path = ""
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `/${l}${path}`;
  languages["x-default"] = `/${defaultLocale}${path}`;

  return {
    canonical: `/${locale}${path}`,
    languages,
  };
}

/**
 * Build-time snapshot of today's date (ISO "YYYY-MM-DD").
 *
 * With `cacheComponents`, reading the clock during prerender is only
 * allowed inside a cached function — same pattern as the footer's
 * `getCurrentYear()`. The value is fixed per deployment and refreshed
 * on the next revalidation/build, which is exactly right for
 * "hide past departures" and sitemap `lastModified`.
 */
export async function getCachedToday(): Promise<string> {
  "use cache";
  return new Date().toISOString().slice(0, 10);
}

// ── JSON-LD builders ────────────────────────────────────────────────────

/** schema.org TravelAgency — rendered on the homepage. */
export function organizationJsonLd(
  branding: SiteBranding,
  siteUrl: string
): Record<string, unknown> {
  const sameAs = [
    branding.social.facebook,
    branding.social.instagram,
    branding.social.tripadvisor,
  ].filter((url): url is string => Boolean(url));

  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: branding.agencyName,
    description: branding.tagline,
    url: siteUrl,
    telephone: branding.contact.phone,
    email: branding.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: branding.contact.address,
      addressLocality: branding.contact.city,
      addressCountry: "MA",
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/** schema.org TouristTrip — rendered on each tour detail page. */
export function tourJsonLd(
  tour: TourRow,
  itinerary: ItineraryRow[],
  locale: Locale,
  siteUrl: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: localizedText(locale, tour.title_fr, tour.title_en, tour.title_ar),
    description: localizedText(
      locale,
      tour.summary_fr,
      tour.summary_en,
      tour.summary_ar
    ),
    url: `${siteUrl}/${locale}/tours/${tour.slug}`,
    inLanguage: locale,
    offers: {
      "@type": "Offer",
      price: tour.price_mad,
      priceCurrency: "MAD",
      availability: "https://schema.org/InStock",
    },
    ...(itinerary.length > 0
      ? {
          itinerary: itinerary.map((day) => ({
            "@type": "ListItem",
            position: day.day_number,
            name: localizedText(
              locale,
              day.title_fr,
              day.title_en,
              day.title_ar
            ),
            description: localizedText(
              locale,
              day.description_fr,
              day.description_en,
              day.description_ar
            ),
          })),
        }
      : {}),
  };
}

/** schema.org BlogPosting — rendered on each blog post page. */
export function blogPostJsonLd(
  post: BlogPostRow,
  locale: Locale,
  siteUrl: string,
  agencyName: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: localizedText(
      locale,
      post.title_fr,
      post.title_en,
      post.title_ar
    ),
    description: localizedText(
      locale,
      post.excerpt_fr,
      post.excerpt_en,
      post.excerpt_ar
    ),
    url: `${siteUrl}/${locale}/blog/${post.slug}`,
    inLanguage: locale,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.published_at ?? post.created_at,
    author: {
      "@type": "Organization",
      name: agencyName,
    },
  };
}

/** schema.org FAQPage — rendered on the FAQ page. */
export function faqJsonLd(
  faqs: FaqRow[],
  locale: Locale
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: localizedText(
        locale,
        faq.question_fr,
        faq.question_en,
        faq.question_ar
      ),
      acceptedAnswer: {
        "@type": "Answer",
        text: localizedText(
          locale,
          faq.answer_fr,
          faq.answer_en,
          faq.answer_ar
        ),
      },
    })),
  };
}