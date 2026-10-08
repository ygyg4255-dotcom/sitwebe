/**
 * Site header: logo, desktop navigation, language switcher, "Book" CTA,
 * and a hamburger menu on mobile. Client component because the mobile
 * menu needs state and the active link needs the current pathname.
 *
 * Links use logical CSS utilities (ms-/me-/start-) so the layout also
 * mirrors correctly for Arabic (RTL) with no changes.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface NavbarProps {
  locale: Locale;
  labels: Dictionary["nav"];
  agencyName: string;
}

export function Navbar({ locale, labels, agencyName }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: `/${locale}`, label: labels.home },
    { href: `/${locale}/tours`, label: labels.tours },
    { href: `/${locale}/destinations`, label: labels.destinations },
    { href: `/${locale}/blog`, label: labels.blog },
    { href: `/${locale}/about`, label: labels.about },
    { href: `/${locale}/contact`, label: labels.contact },
  ];

  const isActive = (href: string) =>
    href === `/${locale}`
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 font-display text-xl text-ink"
        >
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg bg-primary text-lg leading-none text-white"
          >
            ◆
          </span>
          {agencyName}
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-primary"
                  : "text-ink/80 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: languages + CTA (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher currentLocale={locale} srLabel={labels.chooseLanguage} />
          <Link
            href={`/${locale}/contact`}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            {labels.book}
          </Link>
        </div>

        {/* Mobile: language switcher + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher currentLocale={locale} srLabel={labels.chooseLanguage} />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? labels.closeMenu : labels.openMenu}
            className="flex size-10 items-center justify-center rounded-lg text-ink hover:bg-sand"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen ? (
        <nav className="border-t border-brand-border/70 bg-paper px-4 pb-4 pt-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-base font-medium ${
                isActive(link.href)
                  ? "bg-sand text-primary"
                  : "text-ink/80 hover:bg-sand"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={`/${locale}/contact`}
            onClick={() => setMenuOpen(false)}
            className="mt-2 block rounded-full bg-primary px-5 py-2.5 text-center text-sm font-medium text-white"
          >
            {labels.book}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}