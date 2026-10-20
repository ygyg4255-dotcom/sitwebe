"use client";

/**
 * FAQ create/edit form (admin). Same pattern as TourForm.
 */
import { useActionState } from "react";
import { createFaq, updateFaq } from "@/lib/actions/faqs";
import { initialFormState, type ActionResult } from "@/lib/actions/types";
import type { TableRow } from "@/lib/types/database";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/forms/FormBits";
import { Field, FormSection } from "./Field";

export function FaqForm({ faq }: { faq?: TableRow<"faqs"> }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    faq ? updateFaq : createFaq,
    initialFormState
  );
  const errors = state && !state.success ? state.fieldErrors : undefined;
  const ok = state?.success === true;

  return (
    <Card className="p-6 sm:p-8">
      <form action={formAction} className="space-y-2">
        {faq ? <input type="hidden" name="id" value={faq.id} /> : null}

        <FormSection title="Question">
          <Field label="Question (FR) *" htmlFor="faq-questionFr" error={errors?.questionFr}>
            <Input id="faq-questionFr" name="questionFr" required defaultValue={faq?.question_fr} maxLength={300} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Question (EN)" htmlFor="faq-questionEn" error={errors?.questionEn}>
              <Input id="faq-questionEn" name="questionEn" defaultValue={faq?.question_en ?? ""} maxLength={300} />
            </Field>
            <Field label="Question (AR)" htmlFor="faq-questionAr" error={errors?.questionAr}>
              <Input id="faq-questionAr" name="questionAr" defaultValue={faq?.question_ar ?? ""} maxLength={300} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Réponse">
          <Field label="Réponse (FR) *" htmlFor="faq-answerFr" error={errors?.answerFr}>
            <Textarea id="faq-answerFr" name="answerFr" rows={4} required defaultValue={faq?.answer_fr} maxLength={3000} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Réponse (EN)" htmlFor="faq-answerEn" error={errors?.answerEn}>
              <Textarea id="faq-answerEn" name="answerEn" rows={4} defaultValue={faq?.answer_en ?? ""} maxLength={3000} />
            </Field>
            <Field label="Réponse (AR)" htmlFor="faq-answerAr" error={errors?.answerAr}>
              <Textarea id="faq-answerAr" name="answerAr" rows={4} defaultValue={faq?.answer_ar ?? ""} maxLength={3000} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Affichage">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ordre d'affichage" htmlFor="faq-sortOrder" error={errors?.sortOrder}
              hint="Les plus petits nombres apparaissent en premier">
              <Input id="faq-sortOrder" name="sortOrder" type="number" min={0} max={1000} defaultValue={faq?.sort_order ?? 0} />
            </Field>
            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={faq?.is_published ?? true}
                  className="size-4 rounded border-brand-border accent-[var(--brand-primary)]"
                />
                Publiée (visible sur le site)
              </label>
            </div>
          </div>
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
            {faq ? "Enregistrer les modifications" : "Créer la question"}
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}