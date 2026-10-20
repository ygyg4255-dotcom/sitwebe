/**
 * Contact — presentation page: phone, e-mail, address, opening hours,
 * WhatsApp and social links from the white-label branding contract
 * (site_settings), plus the inquiry form (Phase 4): a validated message
 * stored in the inquiries table and read back in the admin area.
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
import { ButtonLink } from "@/components/ui/Button";
import { InquiryForm } from "@/components/forms/InquiryForm";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: dict.pages.contact.title,
    description: dict.pages.contact.subtitle,
    alternates: localeAlternates(locale, "/contact"),
    openGraph: {
      title: dict.pages.contact.title,
      description: dict.pages.contact.subtitle,
      url: `/${locale}/contact`,
    },
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const branding = await getBranding();
  const content = dict.pages.contact;

  const socials = [
    { name: "Facebook", href: branding.social.facebook },
    { name: "Instagram", href: branding.social.instagram },
    { name: "TripAdvisor", href: branding.social.tripadvisor },
  ].filter((social): social is { name: string; href: string } =>
    Boolean(social.href)
  );

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading title={content.title} subtitle={content.subtitle} />

      {/* Contact channels */}
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg text-ink">{content.phoneTitle}</h2>
          <a
            className="mt-2 block text-muted hover:text-primary"
            href={`tel:${branding.contact.phone.replace(/\s/g, "")}`}
          >
            {branding.contact.phone}
          </a>
          <p className="mt-4 text-sm text-muted">{content.hours}</p>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg text-ink">{content.emailTitle}</h2>
          <a
            className="mt-2 block break-all text-muted hover:text-primary"
            href={`mailto:${branding.contact.email}`}
          >
            {branding.contact.email}
          </a>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg text-ink">
            {content.addressTitle}
          </h2>
          <p className="mt-2 text-muted">{branding.contact.address}</p>
          <p className="text-muted">{branding.contact.city}</p>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg text-ink">
            {content.socialTitle}
          </h2>
          <ul className="mt-2 space-y-1">
            {socials.map((social) => (
              <li key={social.name}>
                <a
                  className="text-muted hover:text-primary"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* CTAs */}
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <ButtonLink
          href={`https://wa.me/${branding.contact.whatsapp}`}
          size="lg"
        >
          {content.whatsappCta}
        </ButtonLink>
        <ButtonLink
          href={`mailto:${branding.contact.email}?subject=${encodeURIComponent(content.quoteCta)}`}
          variant="outline"
          size="lg"
        >
          {content.quoteCta}
        </ButtonLink>
      </div>

      {/* Inquiry form (Phase 4): validated server-side, stored in the
          inquiries table, read in the admin inbox */}
      <div className="mx-auto mt-12 max-w-2xl">
        <h2 className="mb-6 text-center font-display text-2xl text-ink">
          {dict.forms.inquiry.title}
        </h2>
        <InquiryForm
          labels={{ ...dict.forms.inquiry, submitting: dict.forms.submitting }}
        />
      </div>
    </Container>
  );
}