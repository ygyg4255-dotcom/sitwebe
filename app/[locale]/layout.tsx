/**
 * ROOT LAYOUT (lives under [locale] so every page gets the right
 * language and text direction on the <html> element).
 *
 * This layout wires together the three foundational systems:
 *   1. i18n     — lang/dir attributes + UI messages from the dictionary
 *   2. Branding — white-label CSS variables applied inline on <html>
 *   3. Fonts    — Marcellus (display) + Inter (body) via next/font
 *
 * Next.js pre-renders one version per locale (see generateStaticParams).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Marcellus } from "next/font/google";
import "@/app/globals.css";
import {
  defaultLocale,
  getDir,
  isLocale,
  locales,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  brandingToCssVars,
  getBranding,
  getSiteUrl,
} from "@/lib/config/site";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Google fonts loaded at build time — no external requests at runtime.
// TODO(i18n): add an Arabic font (e.g. Cairo) when Arabic content lands.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/** Pre-render all locales at build time (ISR-friendly). */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const branding = await getBranding();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${branding.agencyName} — ${branding.tagline}`,
      template: `%s — ${branding.agencyName}`,
    },
    description: dict.meta.description,
    openGraph: {
      siteName: branding.agencyName,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const dict = getDictionary(raw);
  const branding = await getBranding();

  return (
    <html
      lang={raw}
      dir={getDir(raw)}
      style={brandingToCssVars(branding)}
      className={`${inter.variable} ${marcellus.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        <Navbar locale={raw} labels={dict.nav} agencyName={branding.agencyName} />
        <main className="flex-1">{children}</main>
        <Footer
          locale={raw}
          navLabels={dict.nav}
          footer={dict.footer}
          branding={branding}
        />
      </body>
    </html>
  );
}