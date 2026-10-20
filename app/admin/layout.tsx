/**
 * ADMIN ROOT LAYOUT (app/admin is outside [locale]: the admin area is
 * French-only by design, matching the validation messages and the
 * back-office audience — the agency's own staff).
 *
 * Same foundations as the public root layout: white-label branding CSS
 * variables on <html>, globals.css, Marcellus + Inter fonts. The staff
 * guard itself lives in the (protected) route group, so the login page
 * renders without the admin chrome.
 */
import type { Metadata } from "next";
import { Inter, Marcellus } from "next/font/google";
import "@/app/globals.css";
import { brandingToCssVars, getBranding } from "@/lib/config/site";

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

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  return {
    title: {
      default: `Admin — ${branding.agencyName}`,
      template: `%s — Admin ${branding.agencyName}`,
    },
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await getBranding();

  return (
    <html
      lang="fr"
      dir="ltr"
      style={brandingToCssVars(branding)}
      className={`${inter.variable} ${marcellus.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        {children}
      </body>
    </html>
  );
}