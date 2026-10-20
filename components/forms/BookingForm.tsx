"use client";

/**
 * Public booking request form (tour detail page). Progressive
 * enhancement: a plain <form action={serverAction}>; the client layer
 * only adds pending/success/error states and the departure ↔ date
 * toggle. Validation is enforced server-side by Zod (submitBooking);
 * HTML attributes give instant feedback but are never trusted.
 */
import { useActionState, useState } from "react";
import { submitBooking } from "@/lib/actions/bookings";
import { initialFormState, type ActionResult } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { FieldError, FormAlert, FormSuccess, SubmitButton } from "./FormBits";

/** Label shown for one departure option (preformatted for the locale). */
export interface DepartureOption {
  id: string;
  label: string;
}

type BookingLabels = Dictionary["forms"]["booking"] & { submitting: string };

export function BookingForm({
  tourId,
  departures,
  labels,
}: {
  tourId: string;
  departures: DepartureOption[];
  labels: BookingLabels;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    submitBooking,
    initialFormState
  );

  // "" = flexible date; a departure id = fixed departure. The travel
  // date input is only submitted (and shown) in the flexible case.
  const [departureId, setDepartureId] = useState("");
  const errors = state && !state.success ? state.fieldErrors : undefined;

  if (state?.success) {
    return (
      <Card className="p-8 text-center">
        <FormSuccess title={labels.successTitle}>{labels.success}</FormSuccess>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="tourId" value={tourId} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="booking-fullName">{labels.fullName}</Label>
            <Input
              id="booking-fullName"
              name="fullName"
              autoComplete="name"
              required
              maxLength={100}
              minLength={2}
            />
            <FieldError message={errors?.fullName} />
          </div>
          <div>
            <Label htmlFor="booking-email">{labels.email}</Label>
            <Input
              id="booking-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={100}
            />
            <FieldError message={errors?.email} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="booking-phone">{labels.phone}</Label>
            <Input
              id="booking-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
            />
            <FieldError message={errors?.phone} />
          </div>

          <div>
            <Label htmlFor="booking-departure">{labels.departure}</Label>
            <select
              id="booking-departure"
              name="departureId"
              className="w-full rounded-xl border border-brand-border bg-surface px-4 py-2.5 text-ink focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary/40"
              value={departureId}
              onChange={(event) => setDepartureId(event.target.value)}
            >
              <option value="">{labels.flexible}</option>
              {departures.map((departure) => (
                <option key={departure.id} value={departure.id}>
                  {departure.label}
                </option>
              ))}
            </select>
            <FieldError message={errors?.departureId} />
          </div>
        </div>

        {departureId === "" ? (
          <div className="max-w-xs">
            <Label htmlFor="booking-travelDate">{labels.travelDate}</Label>
            <Input id="booking-travelDate" name="travelDate" type="date" />
            <FieldError message={errors?.travelDate} />
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="booking-adults">{labels.adults}</Label>
            <Input
              id="booking-adults"
              name="numAdults"
              type="number"
              min={1}
              max={20}
              defaultValue={1}
              required
            />
            <FieldError message={errors?.numAdults} />
          </div>
          <div>
            <Label htmlFor="booking-children">{labels.children}</Label>
            <Input
              id="booking-children"
              name="numChildren"
              type="number"
              min={0}
              max={20}
              defaultValue={0}
            />
            <FieldError message={errors?.numChildren} />
          </div>
        </div>

        <div>
          <Label htmlFor="booking-message">{labels.message}</Label>
          <Textarea id="booking-message" name="message" rows={4} maxLength={2000} />
          <FieldError message={errors?.message} />
        </div>

        <FormAlert message={state && !state.success ? state.error : undefined} />

        <SubmitButton size="lg" pendingLabel={labels.submitting}>
          {labels.submit}
        </SubmitButton>
      </form>
    </Card>
  );
}