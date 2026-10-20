"use client";

/**
 * Shared building blocks for every form in the project (public booking /
 * inquiry forms, admin CRUD forms, login).
 *
 * SubmitButton  — uses useFormStatus, so it must live INSIDE the <form>
 *                 it belongs to; shows the pending state automatically.
 * FieldError    — first Zod validation message of one field.
 * FormAlert     — banner for the ActionResult error.
 * FormSuccess   — banner shown after a successful submission.
 */
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      className={className}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-sm font-medium text-primary">
      {message}
    </p>
  );
}

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm font-medium text-primary"
    >
      {message}
    </div>
  );
}

export function FormSuccess({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm text-secondary"
    >
      <p className="font-display text-lg text-ink">{title}</p>
      {children ? <p className="mt-1 leading-relaxed">{children}</p> : null}
    </div>
  );
}