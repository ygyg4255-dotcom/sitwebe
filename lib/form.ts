/**
 * FormData parsing helpers for Server Actions with the
 * `(prevState, formData)` signature. Every value coming from a form is
 * untrusted — these helpers only extract strings; validation is done by
 * the Zod schemas in lib/validation.ts, never here.
 */

/** Trimmed string value; missing key → empty string. */
export function formStr(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Textarea → array of non-empty trimmed lines (used for string[] columns). */
export function formLines(formData: FormData, key: string): string[] {
  return formStr(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Checkbox value ("on" when checked, absent when not). */
export function formBool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

/** Numeric value as string ("" → empty string; Zod coerces + validates). */
export function formNum(formData: FormData, key: string): string {
  return formStr(formData, key);
}

/**
 * Collects the entries of a FormData into a plain record (strings only),
 * skipping React's internal `$ACTION_*` keys. Used by actions that parse
 * with an object-schema Zod validator.
 */
export function formObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION_")) continue;
    if (typeof value === "string") out[key] = value.trim();
  }
  return out;
}