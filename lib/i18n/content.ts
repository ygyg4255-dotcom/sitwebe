/**
 * Locale-aware access to the database's translated content columns.
 *
 * Every content table stores a French reference column (mandatory) plus
 * nullable `*_en` / `*_ar` columns. Until translations are scheduled,
 * those columns are NULL — this helper picks the requested locale and
 * falls back to French so a page NEVER shows an empty heading.
 */
import type { Locale } from "./config";

/**
 * Returns the best available text for the locale:
 * the translated value when it exists, the French reference otherwise.
 */
export function localizedText(
  locale: Locale,
  fr: string | null,
  en: string | null,
  ar: string | null
): string {
  if (locale === "en" && en) return en;
  if (locale === "ar" && ar) return ar;
  return fr ?? "";
}