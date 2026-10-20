/**
 * Shared presentational bits for the admin pages (server-safe):
 * page header, booking-status pill, and empty state.
 */

/** Page title + optional description + action button (e.g. "Nouveau"). */
export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  new: { label: "Nouveau", className: "bg-primary/10 text-primary" },
  contacted: { label: "Contacté", className: "bg-sand text-ink" },
  confirmed: { label: "Confirmé", className: "bg-secondary/15 text-secondary" },
  cancelled: { label: "Annulé", className: "bg-muted/15 text-muted" },
};

/** Booking status pill — statuses match the DB check constraint. */
export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.new;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
      {style.label}
    </span>
  );
}

/** Friendly empty state for admin lists. */
export function AdminEmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-border bg-surface px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

/** French date (no time) — admin tables render dates for humans. */
export function formatDateFr(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** French date + time. */
export function formatDateTimeFr(date: string): string {
  return new Date(date).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}