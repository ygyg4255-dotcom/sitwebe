/**
 * English UI messages.
 * Must match the exact structure of the French reference dictionary
 * (`fr.ts`) — the `Dictionary` type enforces it at compile time.
 */
import type { Dictionary } from "./fr";

const en: Dictionary = {
  meta: {
    description:
      "Local travel agency in Morocco. Tailor-made tours, the Sahara desert, imperial medinas and the Atlas Mountains.",
  },
  nav: {
    home: "Home",
    tours: "Tours",
    destinations: "Destinations",
    about: "About",
    contact: "Contact",
    book: "Book now",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    chooseLanguage: "Choose language",
  },
  home: {
    hero: {
      badge: "Local travel agency · Marrakech",
      title: "Discover the",
      titleAccent: "real Morocco",
      subtitle:
        "Tailor-made tours, passionate local guides and genuine encounters — from the dunes of Merzouga to the thousand-year-old alleys of Fès.",
      primaryCta: "Browse our tours",
      secondaryCta: "Get in touch",
    },
    trustBar: [
      { value: "15+", label: "years of experience" },
      { value: "2,500+", label: "travelers hosted" },
      { value: "4.9/5", label: "average guest rating" },
    ],
    featured: {
      eyebrow: "Our tours",
      title: "Popular tours",
      subtitle: "A selection of our most loved trips, designed for small groups.",
      cta: "View all tours",
    },
    destinations: {
      eyebrow: "Destinations",
      title: "Where do you want to go?",
      subtitle:
        "From the Merzouga desert to the valleys of the Atlas, explore the regions we cover.",
      tourCountLabel: "{count} tours",
    },
    testimonials: {
      eyebrow: "Traveler reviews",
      title: "They traveled with us",
      subtitle: "Our travelers' trust is our best calling card.",
    },
    cta: {
      title: "Ready for an unforgettable adventure?",
      subtitle:
        "Tell us about your travel plans — guaranteed reply within 24 hours.",
      primaryCta: "Chat on WhatsApp",
      secondaryCta: "Request a quote",
    },
  },
  common: {
    from: "from",
    currency: "MAD",
    perPerson: "/ person",
    days: "days",
    maxPeople: "people max",
    difficulty: {
      easy: "Easy",
      moderate: "Moderate",
      challenging: "Challenging",
    },
  },
  footer: {
    tagline:
      "A local, attentive travel agency crafting tailor-made journeys across Morocco.",
    contactTitle: "Contact",
    linksTitle: "Quick links",
    followTitle: "Follow us",
    rights: "All rights reserved.",
  },
  pages: {
    tours: { title: "Tours" },
    destinations: { title: "Destinations" },
    about: { title: "About" },
    contact: { title: "Contact" },
  },
  underConstruction: "This page will be completed in a later phase of the project.",
  notFound: {
    title: "Page not found",
    description: "Sorry, the page you are looking for does not exist or has moved.",
    cta: "Back to home",
  },
};

export default en;