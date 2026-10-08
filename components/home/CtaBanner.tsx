/**
 * Full-width closing call to action on a terracotta gradient:
 * WhatsApp button (Phase 4 wires the real number from site settings)
 * and a quote-request link to the contact page.
 */
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

interface CtaBannerProps {
  locale: Locale;
  content: Dictionary["home"]["cta"];
  /** International WhatsApp number, digits only, from the branding contract. */
  whatsapp: string;
}

export function CtaBanner({ locale, content, whatsapp }: CtaBannerProps) {
  return (
    <Container className="pb-16 sm:pb-20">
      <div className="rounded-3xl bg-linear-to-br from-primary to-primary-dark px-6 py-14 text-center sm:px-12">
        <h2 className="font-display text-3xl text-white sm:text-4xl">
          {content.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/85">
          {content.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink
            href={`https://wa.me/${whatsapp}`}
            variant="inverse"
            size="lg"
          >
            {content.primaryCta}
          </ButtonLink>
          <ButtonLink
            href={`/${locale}/contact`}
            variant="inverseGhost"
            size="lg"
          >
            {content.secondaryCta}
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}