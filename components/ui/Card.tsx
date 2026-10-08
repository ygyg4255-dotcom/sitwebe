/**
 * Base card surface — rounded corners, warm hairline border, subtle shadow.
 */
import type { ComponentPropsWithoutRef } from "react";

export function Card({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-brand-border bg-surface shadow-sm ${className ?? ""}`}
      {...props}
    />
  );
}