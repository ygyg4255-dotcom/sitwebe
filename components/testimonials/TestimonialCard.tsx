/**
 * Single testimonial card — used on the homepage section and the
 * testimonials page. Quote text is locale-aware with a French fallback.
 */
import type { Locale } from "@/lib/i18n/config";
import { localizedText } from "@/lib/i18n/content";
import type { TestimonialRow } from "@/lib/queries/content";
import { Card } from "@/components/ui/Card";

interface TestimonialCardProps {
  locale: Locale;
  testimonial: TestimonialRow;
}

export function TestimonialCard({ locale, testimonial }: TestimonialCardProps) {
  const rating = Math.round(testimonial.rating);

  return (
    <Card className="p-6">
      {/* Star rating: filled stars in gold, remainder muted */}
      <p aria-label={`${testimonial.rating}/5`} className="text-accent">
        {"★".repeat(rating)}
        {testimonial.rating < 5 ? (
          <span className="text-muted/50">{"★".repeat(5 - rating)}</span>
        ) : null}
      </p>
      <blockquote className="mt-4 text-sm leading-relaxed text-ink/85">
        “
        {localizedText(
          locale,
          testimonial.quote_fr,
          testimonial.quote_en,
          testimonial.quote_ar
        )}
        ”
      </blockquote>
      <div className="mt-5 flex items-center gap-3 border-t border-brand-border pt-4">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full bg-sand font-display text-sm text-ink"
        >
          {testimonial.author_name.charAt(0)}
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">
            {testimonial.author_name}
          </p>
          {testimonial.author_country ? (
            <p className="text-xs text-muted">{testimonial.author_country}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}