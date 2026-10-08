/**
 * DEMO CONTENT — Phase 1 only.
 *
 * These typed objects feed the homepage shell until the database exists.
 * TODO(Phase 3): replaced by typed Supabase queries (tours, destinations,
 * testimonials tables). The interfaces here deliberately mirror the planned
 * database columns so the swap is straightforward.
 */
import type { PhotoVariant } from "@/components/ui/PhotoPlaceholder";

export interface DemoTour {
  slug: string;
  title: string;
  summary: string;
  /** Starting price in Moroccan Dirham (per person). */
  priceFrom: number;
  durationDays: number;
  groupSizeMax: number;
  difficulty: "easy" | "moderate" | "challenging";
  /** Decorative placeholder style until real photos exist (Phase 2+). */
  photo: PhotoVariant;
}

export interface DemoDestination {
  name: string;
  region: string;
  tourCount: number;
  photo: PhotoVariant;
}

export interface DemoTestimonial {
  author: string;
  country: string;
  /** Rating out of 5. */
  rating: number;
  quote: string;
}

export const demoTours: DemoTour[] = [
  {
    slug: "sahara-merzouga-3-jours",
    title: "Désert du Sahara — 3 jours",
    summary:
      "Traversée du col du Tichka, vallée du Dadès, dunes de Merzouga et une nuit sous les étoiles en bivouac berbère.",
    priceFrom: 1890,
    durationDays: 3,
    groupSizeMax: 12,
    difficulty: "moderate",
    photo: "terracotta",
  },
  {
    slug: "fes-meknes-2-jours",
    title: "Fès & Meknès — 2 jours",
    summary:
      "Les médinas impériales, les tanneries de Fès et les vestiges romains de Volubilis, avec un guide historien.",
    priceFrom: 1290,
    durationDays: 2,
    groupSizeMax: 10,
    difficulty: "easy",
    photo: "teal",
  },
  {
    slug: "chefchaouen-rif-1-jour",
    title: "Chefchaouen & le Rif — 1 jour",
    summary:
      "Journée dans la perle bleue du Rif : ruelles bleues, cascade d'Akchour et déjeuner chez l'habitant.",
    priceFrom: 690,
    durationDays: 1,
    groupSizeMax: 8,
    difficulty: "easy",
    photo: "gold",
  },
];

export const demoDestinations: DemoDestination[] = [
  { name: "Marrakech", region: "Ville impériale", tourCount: 14, photo: "terracotta" },
  { name: "Désert de Merzouga", region: "Sahara", tourCount: 9, photo: "dune" },
  { name: "Chefchaouen", region: "Rif", tourCount: 6, photo: "teal" },
  { name: "Fès", region: "Ville impériale", tourCount: 8, photo: "gold" },
  { name: "Essaouira", region: "Côte atlantique", tourCount: 5, photo: "teal" },
  { name: "Atlas & Ouzoud", region: "Montagnes", tourCount: 7, photo: "dune" },
];

export const demoTestimonials: DemoTestimonial[] = [
  {
    author: "Claire M.",
    country: "France",
    rating: 5,
    quote:
      "Trois jours magiques dans le désert. Notre guide Youssef connaissait chaque dune par son nom.",
  },
  {
    author: "Marco & Elisa",
    country: "Italie",
    rating: 5,
    quote:
      "Organisation impeccable et vraies rencontres humaines. La nuit en bivouac reste notre plus beau souvenir.",
  },
  {
    author: "Sophie D.",
    country: "Belgique",
    rating: 4,
    quote:
      "Ponctualité, bonne humeur et circuits parfaitement adaptés à nos enfants.",
  },
];