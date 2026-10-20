/**
 * Form field label. Used by the contact and booking forms.
 */
import type { ComponentPropsWithoutRef } from "react";

export function Label({ className, ...props }: ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={`mb-1.5 block text-sm font-medium text-ink ${className ?? ""}`}
      {...props}
    />
  );
}