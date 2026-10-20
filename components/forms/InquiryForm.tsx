"use client";

/**
 * Public contact/inquiry form (contact page). Same pattern as the
 * booking form: plain <form action={serverAction}> plus pending /
 * success / error states. Validation happens server-side (Zod).
 */
import { useActionState } from "react";
import { submitInquiry } from "@/lib/actions/inquiries";
import { initialFormState, type ActionResult } from "@/lib/actions/types";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { FieldError, FormAlert, FormSuccess, SubmitButton } from "./FormBits";

type InquiryLabels = Dictionary["forms"]["inquiry"] & { submitting: string };

export function InquiryForm({ labels }: { labels: InquiryLabels }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    submitInquiry,
    initialFormState
  );
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
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="inquiry-name">{labels.name}</Label>
            <Input id="inquiry-name" name="name" autoComplete="name" required minLength={2} maxLength={100} />
            <FieldError message={errors?.name} />
          </div>
          <div>
            <Label htmlFor="inquiry-email">{labels.email}</Label>
            <Input
              id="inquiry-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={100}
            />
            <FieldError message={errors?.email} />
          </div>
        </div>

        <div>
          <Label htmlFor="inquiry-subject">{labels.subject}</Label>
          <Input id="inquiry-subject" name="subject" maxLength={150} />
          <FieldError message={errors?.subject} />
        </div>

        <div>
          <Label htmlFor="inquiry-message">{labels.message}</Label>
          <Textarea id="inquiry-message" name="message" rows={5} required minLength={10} maxLength={2000} />
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