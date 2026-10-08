/**
 * Site footer: brand, contact details, quick links, social links.
 * All content comes from the white-label branding contract
 * (lib/config/site.ts → `site_settings` table in Phase 4).
 */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/messages/fr";
import type { SiteBranding } from "@/lib/config/site";
import { Container } from "@/components/ui/Container";

interface FooterProps {
  locale: Locale;
  navLabels: Dictionary["nav"];
  footer: Dictionary["footer"];
  branding: SiteBranding;
}

/**
 * Current year, cached at build time. With `cacheComponents` enabled,
 * `new Date()` is not allowed during static prerender — caching it makes
 * the value deterministic and fixed for the lifetime of a deployment.
 */
async function getCurrentYear(): Promise<number> {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer({ locale, navLabels, footer, branding }: FooterProps) {
  const quickLinks = [
    { href: `/${locale}`, label: navLabels.home },
    { href: `/${locale}/tours`, label: navLabels.tours },
    { href: `/${locale}/destinations`, label: navLabels.destinations },
    { href: `/${locale}/about`, label: navLabels.about },
    { href: `/${locale}/contact`, label: navLabels.contact },
  ];

  const socials = [
    { name: "Facebook", href: branding.social.facebook },
    { name: "Instagram", href: branding.social.instagram },
    { name: "TripAdvisor", href: branding.social.tripadvisor },
  ].filter((social): social is { name: string; href: string } =>
    Boolean(social.href)
  );

  return (
    <footer className="border-t border-brand-border bg-sand/60">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 font-display text-xl text-ink">
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-lg leading-none text-white"
            >
              ◆
            </span>
            {branding.agencyName}
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {footer.tagline}
          </p>
        </div>

        {/* Contact */}
        <div>
          <h2 className="font-display text-base text-ink">{footer.contactTitle}</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>{branding.contact.address}</li>
            <li>{branding.contact.city}</li>
            <li>
              <a className="hover:text-primary" href={`tel:${branding.contact.phone.replace(/\s/g, "")}`}>
                {branding.contact.phone}
              </a>
            </li>
            <li>
              <a className="hover:text-primary" href={`mailto:${branding.contact.email}`}>
                {branding.contact.email}
              </a>
            </li>
          </ul>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="font-display text-base text-ink">{footer.linksTitle}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link className="text-muted hover:text-primary" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h2 className="font-display text-base text-ink">{footer.followTitle}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {socials.map((social) => (
              <li key={social.name}>
                <a
                  className="text-muted hover:text-primary"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-brand-border/70 py-5">
        <Container className="text-center text-sm text-muted">
          © {await getCurrentYear()} {branding.agencyName}. {footer.rights}
        </Container>
      </div>
    </footer>
  );
}