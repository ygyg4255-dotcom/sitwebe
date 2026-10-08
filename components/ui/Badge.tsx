/**
 * Small pill label for metadata (duration, difficulty, group size, …).
 */
import type { ComponentPropsWithoutRef } from "react";

export type BadgeVariant = "default" | "accent" | "outline";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-sand text-ink",
  accent: "bg-accent/20 text-ink",
  outline: "border border-brand-border text-muted",
};

export interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variantStyles[variant],
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}