"use client";

/**
 * Itinerary manager (admin tour page): a creation form plus one inline
 * edit form per day, with delete. Day numbers are unique per tour.
 */
import { useActionState } from "react";
import { createItineraryDay, updateItineraryDay, deleteItineraryDay } from "@/lib/actions/itinerary";
import { initialFormState, type ActionResult } from "@/lib/actions/types";
import type { TableRow } from "@/lib/types/database";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { SubmitButton } from "@/components/forms/FormBits";
import { DeleteForm } from "@/components/admin/Controls";
import { Field } from "./Field";

const inputClass = "w-full rounded-xl border border-brand-border bg-surface px-3 py-2 text-sm text-ink focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary/40";

/** Shared title/description fields, used by both forms. */
function ItineraryFields({
  day,
  keySuffix,
  errors,
}: {
  day?: TableRow<"tour_itinerary">;
  keySuffix: string;
  errors?: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Jour n° *" htmlFor={`iti-day-${keySuffix}`} error={errors?.dayNumber}>
          <input
            id={`iti-day-${keySuffix}`}
            name="dayNumber"
            type="number"
            min={1}
            max={30}
            required
            defaultValue={day?.day_number ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Titre (FR) *" htmlFor={`iti-titleFr-${keySuffix}`} error={errors?.titleFr}>
          <input
            id={`iti-titleFr-${keySuffix}`}
            name="titleFr"
            required
            maxLength={200}
            defaultValue={day?.title_fr ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Titre (EN)" htmlFor={`iti-titleEn-${keySuffix}`} error={errors?.titleEn}>
          <input
            id={`iti-titleEn-${keySuffix}`}
            name="titleEn"
            maxLength={200}
            defaultValue={day?.title_en ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Titre (AR)" htmlFor={`iti-titleAr-${keySuffix}`} error={errors?.titleAr}>
          <input
            id={`iti-titleAr-${keySuffix}`}
            name="titleAr"
            maxLength={200}
            defaultValue={day?.title_ar ?? ""}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Description (FR)" htmlFor={`iti-descFr-${keySuffix}`} error={errors?.descriptionFr}>
        <Textarea
          id={`iti-descFr-${keySuffix}`}
          name="descriptionFr"
          rows={3}
          maxLength={3000}
          defaultValue={day?.description_fr ?? ""}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Description (EN)" htmlFor={`iti-descEn-${keySuffix}`} error={errors?.descriptionEn}>
          <Textarea
            id={`iti-descEn-${keySuffix}`}
            name="descriptionEn"
            rows={3}
            maxLength={3000}
            defaultValue={day?.description_en ?? ""}
          />
        </Field>
        <Field label="Description (AR)" htmlFor={`iti-descAr-${keySuffix}`} error={errors?.descriptionAr}>
          <Textarea
            id={`iti-descAr-${keySuffix}`}
            name="descriptionAr"
            rows={3}
            maxLength={3000}
            defaultValue={day?.description_ar ?? ""}
          />
        </Field>
      </div>
    </div>
  );
}

export function ItineraryManager({
  tourId,
  itinerary,
}: {
  tourId: string;
  itinerary: Array<TableRow<"tour_itinerary">>;
}) {
  const [createState, createAction] = useActionState<ActionResult | null, FormData>(
    createItineraryDay,
    initialFormState
  );
  const createErrors = createState && !createState.success ? createState.fieldErrors : undefined;

  const nextDayNumber = itinerary.length > 0
    ? Math.max(...itinerary.map((day) => day.day_number)) + 1
    : 1;

  return (
    <div className="space-y-6">
      {itinerary.length === 0 ? (
        <p className="text-sm text-muted">Aucune étape au programme pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {itinerary.map((day) => (
            <li key={day.id} className="rounded-xl border border-brand-border bg-surface p-4">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  Jour {day.day_number} — {day.title_fr}
                </summary>
                <div className="mt-4 space-y-4">
                  <EditItineraryRow day={day} />
                  <div className="flex justify-end">
                    <DeleteForm
                      id={day.id}
                      action={deleteItineraryDay}
                      label="Supprimer ce jour"
                      confirmText="Supprimer cette étape du programme ?"
                    />
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      {/* Creation form */}
      <form action={createAction} className="rounded-xl border border-brand-border bg-surface p-4">
        <input type="hidden" name="tourId" value={tourId} />
        <h3 className="mb-4 font-display text-base text-ink">Ajouter une étape</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Jour n° *" htmlFor="iti-day-new" error={createErrors?.dayNumber}>
            <input
              id="iti-day-new"
              name="dayNumber"
              type="number"
              min={1}
              max={30}
              required
              defaultValue={nextDayNumber}
              className={inputClass}
            />
          </Field>
          <Field label="Titre (FR) *" htmlFor="iti-titleFr-new" error={createErrors?.titleFr}>
            <input id="iti-titleFr-new" name="titleFr" required maxLength={200} className={inputClass} />
          </Field>
          <Field label="Titre (EN)" htmlFor="iti-titleEn-new" error={createErrors?.titleEn}>
            <input id="iti-titleEn-new" name="titleEn" maxLength={200} className={inputClass} />
          </Field>
          <Field label="Titre (AR)" htmlFor="iti-titleAr-new" error={createErrors?.titleAr}>
            <input id="iti-titleAr-new" name="titleAr" maxLength={200} className={inputClass} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Description (FR)" htmlFor="iti-descFr-new" error={createErrors?.descriptionFr}>
            <Textarea id="iti-descFr-new" name="descriptionFr" rows={3} maxLength={3000} />
          </Field>
        </div>
        {createState && !createState.success ? (
          <p role="alert" className="mt-3 text-sm font-medium text-primary">{createState.error}</p>
        ) : null}
        <div className="mt-4">
          <SubmitButton pendingLabel="Ajout…">Ajouter</SubmitButton>
        </div>
      </form>
    </div>
  );
}

/** Inline edit form for one itinerary day. */
function EditItineraryRow({ day }: { day: TableRow<"tour_itinerary"> }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    updateItineraryDay,
    initialFormState
  );
  const errors = state && !state.success ? state.fieldErrors : undefined;

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={day.id} />
      <input type="hidden" name="tourId" value={day.tour_id} />
      <ItineraryFields day={day} keySuffix={day.id} errors={errors} />
      {state && !state.success ? (
        <p role="alert" className="mt-2 text-sm font-medium text-primary">{state.error}</p>
      ) : null}
      {state?.success === true ? (
        <p role="status" className="mt-2 text-sm text-secondary">Enregistré ✓</p>
      ) : null}
      <div className="mt-3">
        <Button type="submit" variant="outline" size="sm">Enregistrer ce jour</Button>
      </div>
    </form>
  );
}