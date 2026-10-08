/**
 * Language switcher — swaps the locale segment of the current URL.
 * All three locales (fr/en/ar) are listed because routing and RTL are
 * already prepared; translations are completed in later phases.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

const localeLabels: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  ar: "AR",
};

interface LocaleSwitcherProps {
  currentLocale: Locale;
  /** Accessible label for the nav landmark (translated per locale). */
  srLabel: string;
}

export function LocaleSwitcher({ currentLocale, srLabel }: LocaleSwitcherProps) {
  const pathname = usePathname() ?? "/";
  const segments = pathname.split("/");

  return (
    <nav
      aria-label={srLabel}
      className="flex items-center rounded-full border border-brand-border bg-surface p-0.5"
    >
      {locales.map((locale) => {
        // Replace the locale segment: /fr/tours → /en/tours
        segments[1] = locale;
        const href = segments.join("/") || "/";

        return (
          <Link
            key={locale}
            href={href}
            aria-current={locale === currentLocale ? "true" : undefined}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
              locale === currentLocale
                ? "bg-primary text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </nav>
  );
}