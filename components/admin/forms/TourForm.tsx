"use client";

/**
 * Tour create/edit form (admin). One component for both cases: pass
 * `tour` for edit (hidden id + update action), omit it for create.
 * The included/excluded string[] columns are edited as one-item-per-
 * line textareas (parsed by formLines in the action).
 */
import { useActionState } from "react";
import { createTour, updateTour } from "@/lib/actions/tours";
import { initialFormState, type ActionResult } from "@/lib/actions/types";
import type { TableRow } from "@/lib/types/database";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/forms/FormBits";
import { ImageUploadField } from "@/components/admin/Controls";
import { Field, FormSection } from "./Field";

const inputClass = "w-full rounded-xl border border-brand-border bg-surface px-4 py-2.5 text-ink focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary/40";

export function TourForm({
  tour,
  destinations,
}: {
  tour?: TableRow<"tours">;
  destinations: Array<{ id: string; name: string }>;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    tour ? updateTour : createTour,
    initialFormState
  );
  const errors = state && !state.success ? state.fieldErrors : undefined;
  const ok = state?.success === true;

  return (
    <Card className="p-6 sm:p-8">
      <form action={formAction} className="space-y-2">
        {tour ? <input type="hidden" name="id" value={tour.id} /> : null}

        <FormSection title="Contenu principal">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Titre (FR) *" htmlFor="tour-titleFr" error={errors?.titleFr}>
              <Input id="tour-titleFr" name="titleFr" required defaultValue={tour?.title_fr} maxLength={200} />
            </Field>
            <Field label="Slug *" htmlFor="tour-slug" error={errors?.slug}
              hint="Identifiant URL : sahara-merzouga-3-jours">
              <Input id="tour-slug" name="slug" required defaultValue={tour?.slug} maxLength={120} />
            </Field>
            <Field label="Titre (EN)" htmlFor="tour-titleEn" error={errors?.titleEn}>
              <Input id="tour-titleEn" name="titleEn" defaultValue={tour?.title_en ?? ""} maxLength={200} />
            </Field>
            <Field label="Titre (AR)" htmlFor="tour-titleAr" error={errors?.titleAr}>
              <Input id="tour-titleAr" name="titleAr" defaultValue={tour?.title_ar ?? ""} maxLength={200} />
            </Field>
          </div>

          <Field label="Résumé (FR)" htmlFor="tour-summaryFr" error={errors?.summaryFr}>
            <Textarea id="tour-summaryFr" name="summaryFr" rows={2} defaultValue={tour?.summary_fr ?? ""} maxLength={600} />
          </Field>
          <Field label="Description (FR)" htmlFor="tour-descriptionFr" error={errors?.descriptionFr}>
            <Textarea id="tour-descriptionFr" name="descriptionFr" rows={5} defaultValue={tour?.description_fr ?? ""} maxLength={10000} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Résumé (EN)" htmlFor="tour-summaryEn" error={errors?.summaryEn}>
              <Textarea id="tour-summaryEn" name="summaryEn" rows={2} defaultValue={tour?.summary_en ?? ""} maxLength={600} />
            </Field>
            <Field label="Résumé (AR)" htmlFor="tour-summaryAr" error={errors?.summaryAr}>
              <Textarea id="tour-summaryAr" name="summaryAr" rows={2} defaultValue={tour?.summary_ar ?? ""} maxLength={600} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Informations pratiques">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Prix (MAD) *" htmlFor="tour-priceMad" error={errors?.priceMad}>
              <Input id="tour-priceMad" name="priceMad" type="number" min={1} required defaultValue={tour?.price_mad ?? ""} />
            </Field>
            <Field label="Durée (jours) *" htmlFor="tour-durationDays" error={errors?.durationDays}>
              <Input id="tour-durationDays" name="durationDays" type="number" min={1} max={60} required defaultValue={tour?.duration_days ?? 1} />
            </Field>
            <Field label="Groupe max" htmlFor="tour-groupSizeMax" error={errors?.groupSizeMax}
              hint="Vide = illimité">
              <Input id="tour-groupSizeMax" name="groupSizeMax" type="number" min={1} max={100} defaultValue={tour?.group_size_max ?? ""} />
            </Field>
            <Field label="Difficulté *" htmlFor="tour-difficulty" error={errors?.difficulty}>
              <select id="tour-difficulty" name="difficulty" defaultValue={tour?.difficulty ?? "easy"} className={inputClass}>
                <option value="easy">Facile</option>
                <option value="moderate">Modéré</option>
                <option value="challenging">Sportif</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Destination" htmlFor="tour-destinationId" error={errors?.destinationId}>
              <select id="tour-destinationId" name="destinationId" defaultValue={tour?.destination_id ?? ""} className={inputClass}>
                <option value="">—</option>
                {destinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lieu de départ" htmlFor="tour-departureLocation" error={errors?.departureLocation}>
              <Input id="tour-departureLocation" name="departureLocation" defaultValue={tour?.departure_location ?? ""} maxLength={150} />
            </Field>
            <Field label="Lieu de retour" htmlFor="tour-returnLocation" error={errors?.returnLocation}>
              <Input id="tour-returnLocation" name="returnLocation" defaultValue={tour?.return_location ?? ""} maxLength={150} />
            </Field>
          </div>

          <ImageUploadField
            name="coverImageUrl"
            folder="tours"
            currentUrl={tour?.cover_image_url ?? null}
            label="Image de couverture (facultatif)"
          />
          {errors?.coverImageUrl ? (
            <p role="alert" className="text-sm font-medium text-primary">{errors.coverImageUrl}</p>
          ) : null}
        </FormSection>

        <FormSection title="Inclus / Non inclus">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Inclus (une ligne par élément)" htmlFor="tour-included" error={errors?.included}>
              <Textarea id="tour-included" name="included" rows={5} defaultValue={(tour?.included ?? []).join("\n")} />
            </Field>
            <Field label="Non inclus (une ligne par élément)" htmlFor="tour-excluded" error={errors?.excluded}>
              <Textarea id="tour-excluded" name="excluded" rows={5} defaultValue={(tour?.excluded ?? []).join("\n")} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Publication">
          <div className="flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked={tour?.is_published ?? false}
                className="size-4 rounded border-brand-border accent-[var(--brand-primary)]"
              />
              Publié (visible sur le site)
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={tour?.is_featured ?? false}
                className="size-4 rounded border-brand-border accent-[var(--brand-primary)]"
              />
              Mis en avant (page d&apos;accueil)
            </label>
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
            {tour ? "Enregistrer les modifications" : "Créer le circuit"}
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}