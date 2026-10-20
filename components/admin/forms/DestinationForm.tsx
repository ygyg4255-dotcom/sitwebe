"use client";

/**
 * Destination create/edit form (admin). Same pattern as TourForm.
 */
import { useActionState } from "react";
import { createDestination, updateDestination } from "@/lib/actions/destinations";
import { initialFormState, type ActionResult } from "@/lib/actions/types";
import type { TableRow } from "@/lib/types/database";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/forms/FormBits";
import { ImageUploadField } from "@/components/admin/Controls";
import { Field, FormSection } from "./Field";

export function DestinationForm({ destination }: { destination?: TableRow<"destinations"> }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    destination ? updateDestination : createDestination,
    initialFormState
  );
  const errors = state && !state.success ? state.fieldErrors : undefined;
  const ok = state?.success === true;

  return (
    <Card className="p-6 sm:p-8">
      <form action={formAction} className="space-y-2">
        {destination ? <input type="hidden" name="id" value={destination.id} /> : null}

        <FormSection title="Identité">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom (FR) *" htmlFor="destination-nameFr" error={errors?.nameFr}>
              <Input id="destination-nameFr" name="nameFr" required defaultValue={destination?.name_fr} maxLength={150} />
            </Field>
            <Field label="Slug *" htmlFor="destination-slug" error={errors?.slug}
              hint="Identifiant URL : marrakech">
              <Input id="destination-slug" name="slug" required defaultValue={destination?.slug} maxLength={120} />
            </Field>
            <Field label="Nom (EN)" htmlFor="destination-nameEn" error={errors?.nameEn}>
              <Input id="destination-nameEn" name="nameEn" defaultValue={destination?.name_en ?? ""} maxLength={150} />
            </Field>
            <Field label="Nom (AR)" htmlFor="destination-nameAr" error={errors?.nameAr}>
              <Input id="destination-nameAr" name="nameAr" defaultValue={destination?.name_ar ?? ""} maxLength={150} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Présentation">
          <Field label="Description (FR)" htmlFor="destination-descriptionFr" error={errors?.descriptionFr}>
            <Textarea id="destination-descriptionFr" name="descriptionFr" rows={4} defaultValue={destination?.description_fr ?? ""} maxLength={2000} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Description (EN)" htmlFor="destination-descriptionEn" error={errors?.descriptionEn}>
              <Textarea id="destination-descriptionEn" name="descriptionEn" rows={4} defaultValue={destination?.description_en ?? ""} maxLength={2000} />
            </Field>
            <Field label="Description (AR)" htmlFor="destination-descriptionAr" error={errors?.descriptionAr}>
              <Textarea id="destination-descriptionAr" name="descriptionAr" rows={4} defaultValue={destination?.description_ar ?? ""} maxLength={2000} />
            </Field>
          </div>

          <ImageUploadField
            name="imageUrl"
            folder="destinations"
            currentUrl={destination?.image_url ?? null}
            label="Image (facultatif)"
          />
          {errors?.imageUrl ? (
            <p role="alert" className="text-sm font-medium text-primary">{errors.imageUrl}</p>
          ) : null}
        </FormSection>

        <FormSection title="Affichage">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ordre d'affichage" htmlFor="destination-sortOrder" error={errors?.sortOrder}
              hint="Les plus petits nombres apparaissent en premier">
              <Input id="destination-sortOrder" name="sortOrder" type="number" min={0} max={1000} defaultValue={destination?.sort_order ?? 0} />
            </Field>
            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={destination?.is_published ?? true}
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
            {destination ? "Enregistrer les modifications" : "Créer la destination"}
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}