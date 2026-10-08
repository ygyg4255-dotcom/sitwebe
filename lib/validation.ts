/**
 * Zod validation schemas — the single source of truth for every input
 * that enters the system (booking forms, contact form, admin forms).
 * Server Actions parse their input against these BEFORE touching the
 * database, so garbage data is rejected at the door.
 *
 * French error messages: the public forms are French-first. Custom
 * per-field messages can be added when other locales get real content.
 */
import { z } from "zod";

/**
 * Helper: "optional text" — trims the input; empty string or null
 * becomes null. Used for all optional text fields.
 */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value && value.length > 0 ? value : null));

/**
 * Helper: "optional value of a schema" — accepts the schema's valid
 * values, or "" / null (both stored as null).
 */
const optional = <T extends z.ZodType>(schema: T) =>
  z
    .union([schema, z.literal(""), z.null()])
    .transform((value) =>
      value === "" || value === null ? null : (value as z.infer<T>)
    );

/** Hex color, e.g. #c0532e (3 or 6 digits). */
const hexColor = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Couleur invalide (format attendu : #c0532e)");

// ── Site settings (white-label branding) ───────────────────────────────
export const siteSettingsSchema = z.object({
  agencyName: z.string().trim().min(2, "Nom trop court").max(100),
  tagline: optionalText(160),
  logoUrl: optional(z.url()),
  primaryColor: hexColor,
  primaryDarkColor: hexColor,
  accentColor: hexColor,
  secondaryColor: hexColor,
  inkColor: hexColor,
  paperColor: hexColor,
  sandColor: hexColor,
  surfaceColor: hexColor,
  mutedColor: hexColor,
  borderColor: hexColor,
  phone: optionalText(30),
  whatsapp: optional(z
    .string()
    .regex(/^\d{6,15}$/, "Numéro WhatsApp invalide (chiffres uniquement, format international)")),
  email: optional(z.email()),
  address: optionalText(200),
  city: optionalText(100),
  facebookUrl: optional(z.url()),
  instagramUrl: optional(z.url()),
  tripadvisorUrl: optional(z.url()),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

// ── Booking request (public form) ──────────────────────────────────────
export const bookingSchema = z.object({
  tourId: optional(z.uuid()),
  departureId: optional(z.uuid()),
  fullName: z.string().trim().min(2, "Nom trop court").max(100),
  email: z.email(),
  phone: optionalText(30),
  travelDate: optional(z.iso.date()),
  numAdults: z.number().int().min(1).max(20).default(1),
  numChildren: z.number().int().min(0).max(20).default(0),
  message: optionalText(2000),
});

export type BookingInput = z.infer<typeof bookingSchema>;

// ── Contact inquiry (public form) ──────────────────────────────────────
export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(100),
  email: z.email(),
  subject: optionalText(150),
  message: z.string().trim().min(10, "Message trop court").max(2000),
});

export type InquiryInput = z.infer<typeof inquirySchema>;