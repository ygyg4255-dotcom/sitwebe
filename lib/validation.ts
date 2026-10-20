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

/**
 * Helper: "optional number" — like `optional` but for coerced numeric
 * fields. Must be checked BEFORE coercion: z.coerce.number() would turn
 * "" into 0, silently storing a zero instead of null. Generic so the
 * inferred type stays number|null (z.ZodType alone widens to unknown).
 */
const optionalNum = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? null : value),
    z.union([schema, z.null()])
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
  // Today-or-later: a booking request cannot target a past date.
  travelDate: optional(
    z
      .iso.date("Date invalide")
      .refine((date) => date >= new Date().toISOString().slice(0, 10), "La date ne peut pas être passée")
  ),
  numAdults: z.coerce.number().int("Nombre invalide").min(1, "Au moins un adulte").max(20).default(1),
  numChildren: z.coerce.number().int("Nombre invalide").min(0).max(20).default(0),
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

// ── Admin login ────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.email("Adresse e-mail invalide"),
  password: z.string().min(6, "Mot de passe trop court").max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ── URL slug: lowercase letters/digits separated by single dashes ───────
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (ex. : sahara-merzouga-3-jours)")
  .max(120);

/** Difficulty matches the tours.difficulty column values. */
const difficulty = z.enum(["easy", "moderate", "challenging"]);

/** Small non-negative integer (form input arrives as a string). */
const positiveInt = (max: number) =>
  z.coerce.number().int("Nombre invalide").min(0, "Doit être positif").max(max);

// ── Tours (admin CRUD) ─────────────────────────────────────────────────
export const tourSchema = z.object({
  id: optional(z.uuid()),
  destinationId: optional(z.uuid()),
  slug,
  titleFr: z.string().trim().min(2, "Titre (FR) trop court").max(200),
  titleEn: optionalText(200),
  titleAr: optionalText(200),
  summaryFr: optionalText(600),
  summaryEn: optionalText(600),
  summaryAr: optionalText(600),
  descriptionFr: optionalText(10000),
  descriptionEn: optionalText(10000),
  descriptionAr: optionalText(10000),
  priceMad: z.coerce.number().int("Prix invalide").min(1, "Prix requis").max(1_000_000),
  durationDays: z.coerce.number().int("Durée invalide").min(1, "Minimum 1 jour").max(60),
  groupSizeMax: optionalNum(positiveInt(100)),
  difficulty,
  coverImageUrl: optional(z.url("URL de l'image invalide")),
  included: z.array(z.string().trim().min(1).max(300)).max(30),
  excluded: z.array(z.string().trim().min(1).max(300)).max(30),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  departureLocation: optionalText(150),
  returnLocation: optionalText(150),
});

export type TourInput = z.infer<typeof tourSchema>;

// ── Destinations (admin CRUD) ─────────────────────────────────────────
export const destinationSchema = z.object({
  id: optional(z.uuid()),
  slug,
  nameFr: z.string().trim().min(2, "Nom (FR) trop court").max(150),
  nameEn: optionalText(150),
  nameAr: optionalText(150),
  descriptionFr: optionalText(2000),
  descriptionEn: optionalText(2000),
  descriptionAr: optionalText(2000),
  imageUrl: optional(z.url("URL de l'image invalide")),
  isPublished: z.boolean(),
  sortOrder: positiveInt(1000),
});

export type DestinationInput = z.infer<typeof destinationSchema>;

// ── Tour departures (admin CRUD) ───────────────────────────────────────
export const departureSchema = z
  .object({
    id: optional(z.uuid()),
    tourId: z.uuid("Circuit invalide"),
    startDate: z.iso.date("Date de départ invalide"),
    endDate: z.iso.date("Date de retour invalide"),
    priceMad: optionalNum(positiveInt(1_000_000)),
    maxParticipants: optionalNum(positiveInt(100)),
    bookedParticipants: positiveInt(100),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "La date de retour doit suivre la date de départ",
    path: ["endDate"],
  });

export type DepartureInput = z.infer<typeof departureSchema>;

// ── Tour itinerary days (admin CRUD) ──────────────────────────────────
export const itinerarySchema = z.object({
  id: optional(z.uuid()),
  tourId: z.uuid("Circuit invalide"),
  dayNumber: z.coerce.number().int().min(1, "Jour invalide").max(30),
  titleFr: z.string().trim().min(2, "Titre (FR) trop court").max(200),
  titleEn: optionalText(200),
  titleAr: optionalText(200),
  descriptionFr: optionalText(3000),
  descriptionEn: optionalText(3000),
  descriptionAr: optionalText(3000),
});

export type ItineraryInput = z.infer<typeof itinerarySchema>;

// ── Testimonials (admin CRUD) ──────────────────────────────────────────
export const testimonialSchema = z.object({
  id: optional(z.uuid()),
  authorName: z.string().trim().min(2, "Nom trop court").max(100),
  authorCountry: optionalText(60),
  rating: z.coerce.number().int("Note invalide").min(1, "Note de 1 à 5").max(5, "Note de 1 à 5"),
  quoteFr: z.string().trim().min(10, "Avis (FR) trop court").max(1000),
  quoteEn: optionalText(1000),
  quoteAr: optionalText(1000),
  avatarUrl: optional(z.url("URL de l'avatar invalide")),
  isPublished: z.boolean(),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

// ── Blog posts (admin CRUD) ────────────────────────────────────────────
export const blogPostSchema = z.object({
  id: optional(z.uuid()),
  slug,
  titleFr: z.string().trim().min(2, "Titre (FR) trop court").max(200),
  titleEn: optionalText(200),
  titleAr: optionalText(200),
  excerptFr: optionalText(600),
  excerptEn: optionalText(600),
  excerptAr: optionalText(600),
  contentFr: optionalText(50000),
  contentEn: optionalText(50000),
  contentAr: optionalText(50000),
  coverImageUrl: optional(z.url("URL de l'image invalide")),
  isPublished: z.boolean(),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

// ── FAQs (admin CRUD) ──────────────────────────────────────────────────
export const faqSchema = z.object({
  id: optional(z.uuid()),
  questionFr: z.string().trim().min(5, "Question (FR) trop courte").max(300),
  questionEn: optionalText(300),
  questionAr: optionalText(300),
  answerFr: z.string().trim().min(5, "Réponse (FR) trop courte").max(3000),
  answerEn: optionalText(3000),
  answerAr: optionalText(3000),
  sortOrder: positiveInt(1000),
  isPublished: z.boolean(),
});

export type FaqInput = z.infer<typeof faqSchema>;

// ── Booking status workflow (admin) ───────────────────────────────────
// Statuses match the bookings.status check constraint (migration 0003):
// new → contacted → confirmed / cancelled.
export const bookingStatusSchema = z.object({
  bookingId: z.uuid("Réservation invalide"),
  status: z.enum(["new", "contacted", "confirmed", "cancelled"], "Statut invalide"),
});

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;

// ── Media upload (admin) ──────────────────────────────────────────────
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB