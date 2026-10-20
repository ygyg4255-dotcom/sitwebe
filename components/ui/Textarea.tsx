/**
 * Form multiline text input. Used by the contact and booking forms.
 */
import type { ComponentPropsWithoutRef } from "react";

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={[
        "w-full rounded-xl border border-brand-border bg-surface px-4 py-2.5 text-ink",
        "placeholder:text-muted/70",
        "focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary/40",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}