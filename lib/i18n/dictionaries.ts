/**
 * Returns the UI message dictionary for a locale.
 * All locales are statically bundled — no async loading needed in Phase 1.
 */
import type { Locale } from "./config";
import fr from "./messages/fr";
import en from "./messages/en";
import ar from "./messages/ar";
import type { Dictionary } from "./messages/fr";

const dictionaries: Record<Locale, Dictionary> = { fr, en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}