/**
 * FAQ — published questions with native <details>/<summary> accordions
 * (keyboard- and screen-reader-accessible with zero JavaScript), plus a
 * FAQPage JSON-LD block for rich search results.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedText } from "@/lib/i18n/content";
import { getPublishedFaqs } from "@/lib/queries/content";
import { faqJsonLd, localeAlternates } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface FaqPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: FaqPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: dict.pages.faq.title,
    description: dict.pages.faq.subtitle,
    alternates: localeAlternates(locale, "/faq"),
    openGraph: {
      title: dict.pages.faq.title,
      description: dict.pages.faq.subtitle,
      url: `/${locale}/faq`,
    },
  };
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const faqs = await getPublishedFaqs();

  return (
    <>
      <JsonLd data={faqJsonLd(faqs, locale)} />

      <Container className="py-16 sm:py-20">
        <SectionHeading
          title={dict.pages.faq.title}
          subtitle={dict.pages.faq.subtitle}
        />

        {faqs.length === 0 ? (
          <p className="mt-10 text-center text-muted">{dict.pages.faq.empty}</p>
        ) : (
          <div className="mx-auto mt-12 max-w-3xl space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group rounded-2xl border border-brand-border bg-surface"
              >
                <summary className="cursor-pointer list-none rounded-2xl px-6 py-4 font-medium text-ink hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden="true"
                    className="me-2 inline-block text-primary transition-transform group-open:rotate-90"
                  >
                    ▸
                  </span>
                  {localizedText(
                    locale,
                    faq.question_fr,
                    faq.question_en,
                    faq.question_ar
                  )}
                </summary>
                <p className="px-6 pb-5 leading-relaxed text-muted">
                  {localizedText(
                    locale,
                    faq.answer_fr,
                    faq.answer_en,
                    faq.answer_ar
                  )}
                </p>
              </details>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}