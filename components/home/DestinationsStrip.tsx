/**
 * Destinations grid — where the agency operates.
 * Phase 3 links each card to its destination page and loads
 * real destination records from Supabase.
 */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { demoDestinations } from "@/lib/demo/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";

interface DestinationsStripProps {
  locale: Locale;
  content: Dictionary["home"]["destinations"];
}

export function DestinationsStrip({ locale, content }: DestinationsStripProps) {
  return (
    <section className="bg-sand/50">
      <Container className="py-16 sm:py-20">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          subtitle={content.subtitle}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {demoDestinations.map((destination) => (
            <Link
              key={destination.name}
              href={`/${locale}/destinations`}
              className="group overflow-hidden rounded-2xl border border-brand-border bg-surface shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative">
                <PhotoPlaceholder
                  variant={destination.photo}
                  className="aspect-[16/9] w-full"
                />
                <p className="absolute top-3 end-3 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  {destination.region}
                </p>
              </div>
              <div className="flex items-center justify-between p-4">
                <h3 className="font-display text-lg text-ink transition-colors group-hover:text-primary">
                  {destination.name}
                </h3>
                <p className="text-sm text-muted">
                  {content.tourCountLabel.replace(
                    "{count}",
                    String(destination.tourCount)
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}