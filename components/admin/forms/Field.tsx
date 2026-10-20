/**
 * Admin form field wrapper: label + control + first validation error.
 * Presentational only (server-renderable); the error comes from the
 * client form's useActionState state.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p role="alert" className="mt-1 text-sm font-medium text-primary">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Section title inside a long admin form. */
export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-8 first:mt-0">
      <legend className="mb-4 font-display text-lg text-ink">{title}</legend>
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}