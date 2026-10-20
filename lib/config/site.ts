/**
 * ─────────────────────────────────────────────────────────────────────────
 * WHITE-LABEL BRANDING CONTRACT
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Everything client-specific (agency name, colors, contact details, social
 * links) lives HERE — never scattered inside components. Re-theming a client
 * means changing this one source of truth.
 *
 * How the colors flow:
 *   getBranding() → brandingToCssVars() → inline CSS variables on <html>
 *     → Tailwind utilities (bg-primary, text-accent, …) pick them up.
 *   The defaults in `app/globals.css` are only a pre-render fallback.
 *
 * Today: `getBranding()` reads the `site_settings` row from Supabase
 *          (editable at /admin/settings) and falls back to the demo
 *          configuration below when the database is unreachable or not
 *          yet configured. Because every component renders through this
 *          contract, that switch requires NO component changes.
 */
import type { CSSProperties } from "react";
import { getSiteSettings } from "@/lib/queries/settings";

export interface SiteBranding {
  /** Display name of the agency (e.g. "Atlas Voyages"). */
  agencyName: string;
  /** Short marketing phrase shown under the name. */
  tagline: string;
  /** Uploaded logo (Supabase Storage), editable at /admin/settings — the public UI does not render it yet. */
  logoUrl: string | null;
  /** Brand colors — hex values, applied as CSS variables at runtime. */
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    secondary: string;
    ink: string;
    paper: string;
    sand: string;
    surface: string;
    muted: string;
    border: string;
  };
  contact: {
    phone: string;
    /** WhatsApp number in international format, digits only (no "+"). */
    whatsapp: string;
    email: string;
    address: string;
    city: string;
  };
  social: {
    facebook: string | null;
    instagram: string | null;
    tripadvisor: string | null;
  };
}

/**
 * Demo configuration — "Atlas Voyages" is a FICTIONAL agency used for
 * development. It contains no real client data by design: it exists to be
 * replaced, either here or from the admin dashboard (/admin/settings).
 */
export const defaultBranding: SiteBranding = {
  agencyName: "Atlas Voyages",
  tagline: "Circuits sur mesure au Maroc",
  logoUrl: null,
  colors: {
    primary: "#c0532e", // Terracotta
    primaryDark: "#9a3f1f",
    accent: "#d9a441", // Saffron gold
    secondary: "#2e6e6a", // Atlas teal
    ink: "#2b2118", // Warm near-black
    paper: "#faf5ec", // Warm off-white
    sand: "#f1e5d0",
    surface: "#fffdf8",
    muted: "#7c6f60",
    border: "#e5d9c5",
  },
  contact: {
    phone: "+212 5 24 00 00 00", // Placeholder demo number
    whatsapp: "212600000000", // Placeholder demo WhatsApp
    email: "contact@atlasvoyages-demo.ma",
    address: "12 Rue Riad Zitoun, Médina",
    city: "Marrakech",
  },
  social: {
    facebook: "https://facebook.com/example",
    instagram: "https://instagram.com/example",
    tripadvisor: "https://tripadvisor.com/example",
  },
};

/**
 * The single access point to the current site branding.
 *
 * Reads the `site_settings` row from Supabase (cached, revalidated by
 * the updateSiteSettings action) and maps it to the SiteBranding
 * contract. Falls back to `defaultBranding` when Supabase is not
 * configured yet, unreachable, or the row is missing — the site
 * NEVER breaks over a branding problem.
 */
export async function getBranding(): Promise<SiteBranding> {
  const row = await getSiteSettings();
  if (!row) return defaultBranding;

  return {
    agencyName: row.agency_name,
    tagline: row.tagline ?? defaultBranding.tagline,
    logoUrl: row.logo_url,
    colors: {
      primary: row.primary_color,
      primaryDark: row.primary_dark_color,
      accent: row.accent_color,
      secondary: row.secondary_color,
      ink: row.ink_color,
      paper: row.paper_color,
      sand: row.sand_color,
      surface: row.surface_color,
      muted: row.muted_color,
      border: row.border_color,
    },
    contact: {
      phone: row.phone ?? defaultBranding.contact.phone,
      whatsapp: row.whatsapp ?? defaultBranding.contact.whatsapp,
      email: row.email ?? defaultBranding.contact.email,
      address: row.address ?? defaultBranding.contact.address,
      city: row.city ?? defaultBranding.contact.city,
    },
    social: {
      facebook: row.facebook_url,
      instagram: row.instagram_url,
      tripadvisor: row.tripadvisor_url,
    },
  };
}

/** Public URL of the site — used for SEO metadata (canonical / Open Graph). */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Converts branding colors into the CSS variables consumed by the design
 * system (see `app/globals.css` → `@theme inline`). Applied as an inline
 * style on <html> in the locale layout.
 */
export function brandingToCssVars(branding: SiteBranding): CSSProperties {
  return {
    "--brand-primary": branding.colors.primary,
    "--brand-primary-dark": branding.colors.primaryDark,
    "--brand-accent": branding.colors.accent,
    "--brand-secondary": branding.colors.secondary,
    "--brand-ink": branding.colors.ink,
    "--brand-paper": branding.colors.paper,
    "--brand-sand": branding.colors.sand,
    "--brand-surface": branding.colors.surface,
    "--brand-muted": branding.colors.muted,
    "--brand-border": branding.colors.border,
  } as CSSProperties;
}