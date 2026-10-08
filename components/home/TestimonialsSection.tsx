/**
 * Customer testimonials — published testimonials from Supabase (cached
 * query, tag "testimonials"). Renders nothing when the database has no
 * testimonial yet.
 */
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { getPublishedTestimonials } from "@/lib/queries/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";

interface TestimonialsSectionProps {
  locale: Locale;
  content: Dictionary["home"]["testimonials"];
}

export async function TestimonialsSection({
  locale,
  content,
}: TestimonialsSectionProps) {
  const testimonials = await getPublishedTestimonials(3);

  if (testimonials.length === 0) return null;

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow={content.eyebrow}
        title={content.title}
        subtitle={content.subtitle}
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            locale={locale}
            testimonial={testimonial}
          />
        ))}
      </div>

      <div className="mt-10 text-center">
        <ButtonLink href={`/${locale}/testimonials`} variant="outline">
          {content.seeAll}
        </ButtonLink>
      </div>
    </Container>
  );
}