/**
 * Homepage hero: value proposition + primary calls to action,
 * next to a decorative photo placeholder (Phase 2+: real imagery).
 */
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";

interface HeroProps {
  locale: Locale;
  content: Dictionary["home"]["hero"];
}

export function Hero({ locale, content }: HeroProps) {
  return (
    <section className="bg-linear-to-b from-sand to-paper">
      <Container className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="inline-flex items-center rounded-full border border-brand-border bg-surface px-4 py-1.5 text-sm font-medium text-ink">
            {content.badge}
          </p>
          <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
            {content.title}{" "}
            <span className="text-primary">{content.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            {content.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href={`/${locale}/tours`} size="lg">
              {content.primaryCta}
            </ButtonLink>
            <ButtonLink
              href={`/${locale}/contact`}
              variant="outline"
              size="lg"
            >
              {content.secondaryCta}
            </ButtonLink>
          </div>
        </div>

        <PhotoPlaceholder
          variant="terracotta"
          label="Désert de Merzouga"
          className="aspect-[4/3] w-full rounded-3xl shadow-lg"
        />
      </Container>
    </section>
  );
}