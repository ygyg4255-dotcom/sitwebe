/**
 * Homepage — assembles the home sections (hero, trust figures, popular
 * tours, destinations, testimonials, call to action).
 * Content comes from the locale dictionary + the white-label branding
 * contract; tour/destination data is demo data until Phase 3.
 */
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getBranding } from "@/lib/config/site";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedTours } from "@/components/home/FeaturedTours";
import { DestinationsStrip } from "@/components/home/DestinationsStrip";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CtaBanner } from "@/components/home/CtaBanner";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const branding = await getBranding();

  return (
    <>
      <Hero locale={locale} content={dict.home.hero} />
      <TrustBar items={dict.home.trustBar} />
      <FeaturedTours locale={locale} dict={dict} />
      <DestinationsStrip locale={locale} content={dict.home.destinations} />
      <TestimonialsSection content={dict.home.testimonials} />
      <CtaBanner
        locale={locale}
        content={dict.home.cta}
        whatsapp={branding.contact.whatsapp}
      />
    </>
  );
}