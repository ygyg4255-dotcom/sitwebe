"use client";

/**
 * Small interactive admin controls. Each is a thin client wrapper over
 * a server action; the data mutations themselves (validation, guards,
 * cache refresh) all live in the "use server" files.
 */
import { useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/actions/types";
import { uploadMedia, type UploadResult } from "@/lib/actions/media";
import { Button } from "@/components/ui/Button";

/** Generic publish/unpublish toggle (tours, destinations, …). */
export function TogglePublished({
  id,
  isPublished,
  action,
  labels,
}: {
  id: string;
  isPublished: boolean;
  action: (id: string, isPublished: boolean) => Promise<ActionResult>;
  labels: { publish: string; unpublish: string };
}) {
  const [published, setPublished] = useState(isPublished);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = () => {
    const next = !published;
    setError(null);
    startTransition(async () => {
      const result = await action(id, next);
      if (result.success) {
        setPublished(next);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant={published ? "outline" : "secondary"}
        size="sm"
        onClick={toggle}
        disabled={pending}
        aria-pressed={published}
      >
        {pending ? "…" : published ? labels.unpublish : labels.publish}
      </Button>
      {error ? <span role="alert" className="text-xs text-primary">{error}</span> : null}
    </span>
  );
}

/** Destructive action behind a confirmation dialog. */
export function DeleteForm({
  id,
  action,
  label,
  confirmText,
}: {
  id: string;
  action: (formData: FormData) => Promise<ActionResult>;
  label: string;
  confirmText: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(formData: FormData) => {
        startTransition(async () => {
          const result = await action(formData);
          if (!result.success) setError(result.error);
        });
      }}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending} className="text-primary hover:bg-primary/10">
        {pending ? "…" : label}
      </Button>
      {error ? <span role="alert" className="block text-xs text-primary">{error}</span> : null}
    </form>
  );
}

/** Booking status workflow: new → contacted → confirmed / cancelled. */
export function BookingStatusForm({ bookingId, status }: { bookingId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const STATUSES: Array<{ value: string; label: string }> = [
    { value: "new", label: "Nouveau" },
    { value: "contacted", label: "Contacté" },
    { value: "confirmed", label: "Confirmé" },
    { value: "cancelled", label: "Annulé" },
  ];

  return (
    <span className="inline-flex flex-col gap-1">
      <select
        aria-label="Statut de la réservation"
        defaultValue={status}
        disabled={pending}
        className="rounded-xl border border-brand-border bg-surface px-3 py-1.5 text-sm text-ink focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary/40"
        onChange={(event) => {
          setError(null);
          startTransition(async () => {
            const { updateBookingStatus } = await import("@/lib/actions/bookings");
            const result = await updateBookingStatus(bookingId, event.target.value);
            if (!result.success) setError(result.error);
          });
        }}
      >
        {STATUSES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {pending ? <span className="text-xs text-muted">Enregistrement…</span> : null}
      {error ? <span role="alert" className="text-xs text-primary">{error}</span> : null}
    </span>
  );
}

/** Mark an inbox message read/unread. */
export function MarkReadButton({
  inquiryId,
  isRead,
}: {
  inquiryId: string;
  isRead: boolean;
}) {
  const [read, setRead] = useState(isRead);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          const next = !read;
          setError(null);
          startTransition(async () => {
            const { markInquiryRead } = await import("@/lib/actions/inquiries");
            const result = await markInquiryRead(inquiryId, next);
            if (result.success) setRead(next);
            else setError(result.error);
          });
        }}
      >
        {pending ? "…" : read ? "Marquer non lu" : "Marquer comme lu"}
      </Button>
      {error ? <span role="alert" className="text-xs text-primary">{error}</span> : null}
    </span>
  );
}

/**
 * Image field with direct upload to the public "media" bucket. The
 * upload happens immediately (staff session enforced by storage RLS);
 * the resulting public URL is carried into the parent form through a
 * hidden input, so the normal create/update flow just stores the URL.
 */
export function ImageUploadField({
  name,
  folder,
  currentUrl,
  label,
}: {
  name: string;
  folder: string;
  currentUrl: string | null;
  label: string;
}) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const upload = () => {
    const file = fileInput.current?.files?.[0];
    if (!file) {
      setError("Choisissez d'abord un fichier.");
      return;
    }
    setError(null);
    setOk(false);
    const formData = new FormData();
    formData.append("folder", folder);
    formData.append("file", file);
    startTransition(async () => {
      const result: UploadResult = await uploadMedia(formData);
      if (result.success) {
        setUrl(result.url);
        setOk(true);
        if (fileInput.current) fileInput.current.value = "";
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <p className="mb-1.5 block text-sm font-medium text-ink">{label}</p>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="block w-full max-w-sm text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-sand file:px-3 file:py-1.5 file:text-sm file:text-ink"
          aria-label={label}
        />
        <Button type="button" variant="outline" size="sm" onClick={upload} disabled={pending}>
          {pending ? "Envoi…" : "Envoyer l'image"}
        </Button>
      </div>
      {url ? (
        <p className="mt-1 break-all text-xs text-muted">
          Image actuelle :{" "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-secondary underline">
            {url}
          </a>
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted">Aucune image.</p>
      )}
      {ok ? <p className="mt-1 text-xs text-secondary">Image envoyée ✓</p> : null}
      {error ? <p role="alert" className="mt-1 text-xs text-primary">{error}</p> : null}
    </div>
  );
}