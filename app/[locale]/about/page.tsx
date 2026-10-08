/**
 * About — the agency's story and values. Copy is dictionary-driven
 * (there is no "about" database table); the key figures reuse the home
 * trust bar and the closing banner reuses the home CTA.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getBranding } from "@/lib/config/site";
import { localeAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { CtaBanner } from "@/components/home/CtaBanner";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: dict.pages.about.title,
    description: dict.pages.about.subtitle,
    alternates: localeAlternates(locale, "/about"),
    openGraph: {
      title: dict.pages.about.title,
      description: dict.pages.about.subtitle,
      url: `/${locale}/about`,
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const branding = await getBranding();
  const about = dict.pages.about;

  return (
    <>
      <Container className="py-16 sm:py-20">
        <SectionHeading title={about.title} subtitle={about.subtitle} />

        {/* Story */}
        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="text-center font-display text-2xl text-ink sm:text-3xl">
            {about.storyTitle}
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink/85">
            {about.story.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mx-auto mt-16 max-w-5xl">
          <SectionHeading title={about.valuesTitle} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {about.values.map((value) => (
              <Card key={value.title} className="p-6">
                <h3 className="font-display text-xl text-ink">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </Container>

      <CtaBanner
        locale={locale}
        content={dict.home.cta}
        whatsapp={branding.contact.whatsapp}
      />
    </>
  );
}