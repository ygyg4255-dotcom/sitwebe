/**
 * Buttons — the two exports cover both use cases:
 *   <Button>      → real <button> element (forms, interactions — Phase 4)
 *   <ButtonLink>  → next/link styled as a button (navigation)
 *
 * Variants: primary (terracotta), secondary (teal), outline, ghost,
 * inverse + inverseGhost (for use on colored/gradient backgrounds).
 */
import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "inverse"
  | "inverseGhost";

export type ButtonSize = "sm" | "md" | "lg";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-secondary text-white hover:bg-secondary/90",
  outline:
    "border border-brand-border bg-surface text-ink hover:border-primary hover:text-primary",
  ghost: "text-ink hover:bg-sand",
  inverse: "bg-white text-primary hover:bg-sand",
  inverseGhost: "text-white hover:bg-white/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}

export type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={[
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}