/**
 * Homepage — assembles the home sections (hero, trust figures, featured
 * tours, destinations, testimonials, call to action).
 *
 * Section content (labels, copy) comes from the locale dictionary and
 * the white-label branding contract; tour/destination/testimonial data
 * comes LIVE from Supabase (Phase 3).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getBranding, getSiteUrl } from "@/lib/config/site";
import { localeAlternates, organizationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedTours } from "@/components/home/FeaturedTours";
import { DestinationsStrip } from "@/components/home/DestinationsStrip";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CtaBanner } from "@/components/home/CtaBanner";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const branding = await getBranding();

  return {
    description: dict.meta.description,
    alternates: localeAlternates(locale),
    openGraph: {
      siteName: branding.agencyName,
      type: "website",
      title: `${branding.agencyName} — ${branding.tagline}`,
      description: dict.meta.description,
      url: `/${locale}`,
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const branding = await getBranding();

  return (
    <>
      <JsonLd data={organizationJsonLd(branding, getSiteUrl())} />
      <Hero locale={locale} content={dict.home.hero} />
      <TrustBar items={dict.home.trustBar} />
      <FeaturedTours locale={locale} dict={dict} />
      <DestinationsStrip locale={locale} content={dict.home.destinations} />
      <TestimonialsSection locale={locale} content={dict.home.testimonials} />
      <CtaBanner
        locale={locale}
        content={dict.home.cta}
        whatsapp={branding.contact.whatsapp}
      />
    </>
  );
}