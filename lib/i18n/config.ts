/**
 * Supported locales configuration.
 *
 * French ("fr") is the default and only fully-translated locale for now.
 * "en" and "ar" dictionaries already exist (see ./messages/), so the whole
 * pipeline — locale routing, switching, RTL direction — is verifiable today.
 * Arabic switches the page to right-to-left automatically via `getDir()`.
 */
export const locales = ["fr", "en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

/** Type guard: checks that a URL segment is one of the supported locales. */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Writing direction for a locale — Arabic is right-to-left. */
export function getDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}