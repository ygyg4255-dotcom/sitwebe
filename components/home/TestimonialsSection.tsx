/**
 * Customer testimonials — star ratings, quotes, author, country.
 * Phase 3 loads published testimonials from Supabase.
 */
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { demoTestimonials } from "@/lib/demo/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

interface TestimonialsSectionProps {
  content: Dictionary["home"]["testimonials"];
}

export function TestimonialsSection({ content }: TestimonialsSectionProps) {
  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow={content.eyebrow}
        title={content.title}
        subtitle={content.subtitle}
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {demoTestimonials.map((testimonial) => (
          <Card key={testimonial.author} className="p-6">
            {/* Star rating: filled stars in gold, remainder muted */}
            <p aria-label={`${testimonial.rating}/5`} className="text-accent">
              {"★".repeat(testimonial.rating)}
              <span className="text-muted/50">
                {"★".repeat(5 - testimonial.rating)}
              </span>
            </p>
            <blockquote className="mt-4 text-sm leading-relaxed text-ink/85">
              “{testimonial.quote}”
            </blockquote>
            <div className="mt-5 flex items-center gap-3 border-t border-brand-border pt-4">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-full bg-sand font-display text-sm text-ink"
              >
                {testimonial.author.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {testimonial.author}
                </p>
                <p className="text-xs text-muted">{testimonial.country}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}