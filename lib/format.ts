/**
 * Locale-aware formatting for prices and dates (Intl, no extra dependency).
 * Deterministic given its inputs — safe to call during static prerender.
 */
import type { Locale } from "@/lib/i18n/config";

/** Intl tag used per site locale. */
const INTL_LOCALES: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
  ar: "ar-MA",
};

/**
 * Groups a price the way the visitor's locale expects
 * (e.g. 1890 → "1 890" in fr, "1,890" in en).
 * The currency label ("MAD") is rendered separately by the UI.
 */
export function formatPrice(value: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALES[locale], {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a date (ISO string from the database) as a long local date,
 * e.g. "15 mars 2027" / "15 March 2027".
 */
export function formatDate(iso: string, locale: Locale): string {
  // Date-only strings ("2027-03-15") are parsed as UTC midnight —
  // consistent everywhere, no timezone drift.
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}