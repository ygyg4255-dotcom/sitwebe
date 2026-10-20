import type { z } from "zod";

/**
 * Shared return type for every Server Action. Components render a
 * success/error message from it; `fieldErrors` maps form field names
 * (camelCase, as in the Zod schemas) to their first validation error,
 * so forms can highlight the offending inputs.
 */
export type ActionResult =
  | { success: true }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

/** Initial state for useActionState before the first submission. */
export const initialFormState: ActionResult | null = null;

/**
 * Converts a Zod failure into the ActionResult failure shape:
 * a headline error (first issue) plus per-field messages.
 */
export function zodFailure(error: z.ZodError): Extract<ActionResult, { success: false }> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return {
    success: false,
    error: error.issues[0]?.message ?? "Données invalides.",
    fieldErrors,
  };
}