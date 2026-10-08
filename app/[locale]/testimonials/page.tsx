/**
 * Testimonials — every published review from Supabase, with the average
 * rating as a summary line.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPublishedTestimonials } from "@/lib/queries/content";
import { localeAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";

interface TestimonialsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TestimonialsPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: dict.pages.testimonials.title,
    description: dict.pages.testimonials.subtitle,
    alternates: localeAlternates(locale, "/testimonials"),
    openGraph: {
      title: dict.pages.testimonials.title,
      description: dict.pages.testimonials.subtitle,
      url: `/${locale}/testimonials`,
    },
  };
}

export default async function TestimonialsPage({ params }: TestimonialsPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const testimonials = await getPublishedTestimonials();

  const average =
    testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) /
        testimonials.length
      : null;

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        title={dict.pages.testimonials.title}
        subtitle={dict.pages.testimonials.subtitle}
      />

      {testimonials.length === 0 ? (
        <p className="mt-10 text-center text-muted">
          {dict.pages.testimonials.empty}
        </p>
      ) : (
        <>
          {average !== null ? (
            <p className="mt-6 text-center text-muted">
              {dict.pages.testimonials.averageLabel}{" "}
              <span className="font-display text-xl text-primary">
                {average.toLocaleString(locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR", {
                  maximumFractionDigits: 1,
                })}
                {dict.pages.testimonials.ratingSuffix}
              </span>
            </p>
          ) : null}

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                locale={locale}
                testimonial={testimonial}
              />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}