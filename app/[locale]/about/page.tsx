/**
 * About page — STUB (Phase 3 builds the real page).
 * Exists so navigation and SEO titles already work.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : defaultLocale);
  return {
    title: dict.pages.about.title,
    description: dict.meta.description,
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <Container className="py-20 sm:py-28">
      <SectionHeading
        title={dict.pages.about.title}
        subtitle={dict.underConstruction}
      />
      <div className="mt-10 text-center">
        <ButtonLink href={`/${locale}`}>{dict.nav.home}</ButtonLink>
      </div>
    </Container>
  );
}