"use client";

/**
 * Departure manager (admin tour page): a creation form plus one inline
 * edit form per scheduled departure, with delete. After every action
 * the server re-renders the page (updateTag), so the rows stay fresh.
 */
import { useActionState } from "react";
import { createDeparture, updateDeparture, deleteDeparture } from "@/lib/actions/departures";
import { initialFormState, type ActionResult } from "@/lib/actions/types";
import type { TableRow } from "@/lib/types/database";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/forms/FormBits";
import { DeleteForm } from "@/components/admin/Controls";
import { Field } from "./Field";

const inputClass = "w-full rounded-xl border border-brand-border bg-surface px-3 py-2 text-sm text-ink focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary/40";

/** The shared date/price/capacity fields, used by both forms. */
function DepartureFields({
  departure,
  errors,
}: {
  departure?: TableRow<"tour_departures">;
  errors?: Record<string, string>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Field label="Départ *" htmlFor={`dep-start-${departure?.id ?? "new"}`} error={errors?.startDate}>
        <input
          id={`dep-start-${departure?.id ?? "new"}`}
          name="startDate"
          type="date"
          required
          defaultValue={departure?.start_date ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Retour *" htmlFor={`dep-end-${departure?.id ?? "new"}`} error={errors?.endDate}>
        <input
          id={`dep-end-${departure?.id ?? "new"}`}
          name="endDate"
          type="date"
          required
          defaultValue={departure?.end_date ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Prix (MAD)" htmlFor={`dep-price-${departure?.id ?? "new"}`} error={errors?.priceMad}
        hint="Vide = prix du circuit">
        <input
          id={`dep-price-${departure?.id ?? "new"}`}
          name="priceMad"
          type="number"
          min={0}
          defaultValue={departure?.price_mad ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Places max" htmlFor={`dep-max-${departure?.id ?? "new"}`} error={errors?.maxParticipants}
        hint="Vide = illimité">
        <input
          id={`dep-max-${departure?.id ?? "new"}`}
          name="maxParticipants"
          type="number"
          min={0}
          defaultValue={departure?.max_participants ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Réservées" htmlFor={`dep-booked-${departure?.id ?? "new"}`} error={errors?.bookedParticipants}>
        <input
          id={`dep-booked-${departure?.id ?? "new"}`}
          name="bookedParticipants"
          type="number"
          min={0}
          defaultValue={departure?.booked_participants ?? 0}
          className={inputClass}
        />
      </Field>
    </div>
  );
}

export function DepartureManager({
  tourId,
  departures,
}: {
  tourId: string;
  departures: Array<TableRow<"tour_departures">>;
}) {
  const [createState, createAction] = useActionState<ActionResult | null, FormData>(
    createDeparture,
    initialFormState
  );
  const createErrors = createState && !createState.success ? createState.fieldErrors : undefined;

  return (
    <div className="space-y-6">
      {departures.length === 0 ? (
        <p className="text-sm text-muted">Aucun départ planifié pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {departures.map((departure) => (
            <li key={departure.id} className="rounded-xl border border-brand-border bg-surface p-4">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  {new Date(departure.start_date).toLocaleDateString("fr-FR")} →{" "}
                  {new Date(departure.end_date).toLocaleDateString("fr-FR")}
                  {departure.max_participants !== null ? (
                    <span className="ml-2 text-xs text-muted">
                      ({departure.booked_participants}/{departure.max_participants} places)
                    </span>
                  ) : null}
                </summary>
                <div className="mt-4 space-y-4">
                  <EditDepartureRow
                    departure={departure}
                  />
                  <div className="flex justify-end">
                    <DeleteForm
                      id={departure.id}
                      action={deleteDeparture}
                      label="Supprimer ce départ"
                      confirmText="Supprimer ce départ ? Les réservations existantes ne seront pas supprimées."
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
        <h3 className="mb-4 font-display text-base text-ink">Ajouter un départ</h3>
        <DepartureFields errors={createErrors} />
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

/** Inline edit form for one departure row. */
function EditDepartureRow({ departure }: { departure: TableRow<"tour_departures"> }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    updateDeparture,
    initialFormState
  );
  const errors = state && !state.success ? state.fieldErrors : undefined;

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={departure.id} />
      <input type="hidden" name="tourId" value={departure.tour_id} />
      <DepartureFields departure={departure} errors={errors} />
      {state && !state.success ? (
        <p role="alert" className="mt-2 text-sm font-medium text-primary">{state.error}</p>
      ) : null}
      {state?.success === true ? (
        <p role="status" className="mt-2 text-sm text-secondary">Enregistré ✓</p>
      ) : null}
      <div className="mt-3">
        <Button type="submit" variant="outline" size="sm">Enregistrer ce départ</Button>
      </div>
    </form>
  );
}