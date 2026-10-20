"use client";

/**
 * Testimonial create/edit form (admin). Same pattern as TourForm.
 */
import { useActionState } from "react";
import { createTestimonial, updateTestimonial } from "@/lib/actions/testimonials";
import { initialFormState, type ActionResult } from "@/lib/actions/types";
import type { TableRow } from "@/lib/types/database";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/forms/FormBits";
import { ImageUploadField } from "@/components/admin/Controls";
import { Field, FormSection } from "./Field";

const inputClass = "w-full rounded-xl border border-brand-border bg-surface px-4 py-2.5 text-ink focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary/40";

export function TestimonialForm({ testimonial }: { testimonial?: TableRow<"testimonials"> }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    testimonial ? updateTestimonial : createTestimonial,
    initialFormState
  );
  const errors = state && !state.success ? state.fieldErrors : undefined;
  const ok = state?.success === true;

  return (
    <Card className="p-6 sm:p-8">
      <form action={formAction} className="space-y-2">
        {testimonial ? <input type="hidden" name="id" value={testimonial.id} /> : null}

        <FormSection title="Auteur">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom *" htmlFor="testimonial-authorName" error={errors?.authorName}>
              <Input id="testimonial-authorName" name="authorName" required defaultValue={testimonial?.author_name} maxLength={100} />
            </Field>
            <Field label="Pays" htmlFor="testimonial-authorCountry" error={errors?.authorCountry}
              hint="Ex. : France">
              <Input id="testimonial-authorCountry" name="authorCountry" defaultValue={testimonial?.author_country ?? ""} maxLength={60} />
            </Field>
          </div>
          <Field label="Note *" htmlFor="testimonial-rating" error={errors?.rating}
            hint="De 1 à 5 étoiles">
            <select id="testimonial-rating" name="rating" defaultValue={testimonial?.rating ?? 5} className={inputClass}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {"★".repeat(rating)} ({rating}/5)
                </option>
              ))}
            </select>
          </Field>

          <ImageUploadField
            name="avatarUrl"
            folder="misc"
            currentUrl={testimonial?.avatar_url ?? null}
            label="Avatar (facultatif)"
          />
          {errors?.avatarUrl ? (
            <p role="alert" className="text-sm font-medium text-primary">{errors.avatarUrl}</p>
          ) : null}
        </FormSection>

        <FormSection title="Avis">
          <Field label="Avis (FR) *" htmlFor="testimonial-quoteFr" error={errors?.quoteFr}>
            <Textarea id="testimonial-quoteFr" name="quoteFr" rows={3} required defaultValue={testimonial?.quote_fr} maxLength={1000} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Avis (EN)" htmlFor="testimonial-quoteEn" error={errors?.quoteEn}>
              <Textarea id="testimonial-quoteEn" name="quoteEn" rows={3} defaultValue={testimonial?.quote_en ?? ""} maxLength={1000} />
            </Field>
            <Field label="Avis (AR)" htmlFor="testimonial-quoteAr" error={errors?.quoteAr}>
              <Textarea id="testimonial-quoteAr" name="quoteAr" rows={3} defaultValue={testimonial?.quote_ar ?? ""} maxLength={1000} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Publication">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={testimonial?.is_published ?? false}
              className="size-4 rounded border-brand-border accent-[var(--brand-primary)]"
            />
            Publié (visible sur le site)
          </label>
        </FormSection>

        {state && !state.success ? (
          <div role="alert" className="mt-6 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
            {state.error}
          </div>
        ) : null}
        {ok ? (
          <div role="status" className="mt-6 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm text-secondary">
            Enregistré ✓
          </div>
        ) : null}

        <div className="mt-6">
          <SubmitButton pendingLabel="Enregistrement…">
            {testimonial ? "Enregistrer les modifications" : "Créer l'avis"}
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}