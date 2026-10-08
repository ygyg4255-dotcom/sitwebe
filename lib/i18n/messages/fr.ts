/**
 * French UI messages — the REFERENCE dictionary for the whole project.
 *
 * The `Dictionary` type is derived from this file. Every other locale
 * (en, ar) must provide the exact same keys — the TypeScript compiler
 * enforces it, so a missing translation is a build error, not a runtime bug.
 *
 * Note: dictionaries hold UI labels only. Business content (tours,
 * destinations, testimonials…) comes from the database in later phases —
 * Phase 1 uses the demo data in `lib/demo/content.ts`.
 */
const fr = {
  meta: {
    description:
      "Agence de voyages locale au Maroc. Circuits sur mesure, désert du Sahara, médinas impériales et montagnes de l'Atlas.",
  },
  nav: {
    home: "Accueil",
    tours: "Circuits",
    destinations: "Destinations",
    about: "À propos",
    contact: "Contact",
    book: "Réserver",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    chooseLanguage: "Choisir la langue",
  },
  home: {
    hero: {
      badge: "Agence de voyages locale · Marrakech",
      title: "Vivez le Maroc",
      titleAccent: "authentique",
      subtitle:
        "Circuits sur mesure, guides locaux passionnés et rencontres vraies — des dunes de Merzouga aux ruelles millénaires de Fès.",
      primaryCta: "Découvrir nos circuits",
      secondaryCta: "Nous contacter",
    },
    trustBar: [
      { value: "15+", label: "années d'expérience" },
      { value: "2 500+", label: "voyageurs accompagnés" },
      { value: "4,9/5", label: "note moyenne des clients" },
    ],
    featured: {
      eyebrow: "Nos circuits",
      title: "Circuits populaires",
      subtitle:
        "Une sélection de nos voyages les plus appréciés, pensés pour les petits groupes.",
      cta: "Voir tous les circuits",
    },
    destinations: {
      eyebrow: "Destinations",
      title: "Où voulez-vous aller ?",
      subtitle:
        "Du désert de Merzouga aux vallées de l'Atlas, explorez les régions que nous couvrons.",
      tourCountLabel: "{count} circuits",
    },
    testimonials: {
      eyebrow: "Avis voyageurs",
      title: "Ils ont voyagé avec nous",
      subtitle: "La confiance de nos voyageurs est notre meilleure carte de visite.",
    },
    cta: {
      title: "Prêt à vivre une aventure inoubliable ?",
      subtitle: "Parlez-nous de votre projet de voyage — réponse garantie sous 24 h.",
      primaryCta: "Écrire sur WhatsApp",
      secondaryCta: "Demander un devis",
    },
  },
  common: {
    from: "à partir de",
    currency: "MAD",
    perPerson: "/ pers.",
    days: "jours",
    maxPeople: "pers. max",
    difficulty: {
      easy: "Facile",
      moderate: "Modéré",
      challenging: "Sportif",
    },
  },
  footer: {
    tagline:
      "Agence de voyages locale, à l'écoute, créatrice de circuits sur mesure au Maroc.",
    contactTitle: "Contact",
    linksTitle: "Liens rapides",
    followTitle: "Suivez-nous",
    rights: "Tous droits réservés.",
  },
  pages: {
    tours: { title: "Circuits" },
    destinations: { title: "Destinations" },
    about: { title: "À propos" },
    contact: { title: "Contact" },
  },
  underConstruction:
    "Cette page sera complétée lors d'une phase ultérieure du projet.",
  notFound: {
    title: "Page introuvable",
    description: "Désolé, la page que vous cherchez n'existe pas ou a été déplacée.",
    cta: "Retour à l'accueil",
  },
};

export default fr;

/**
 * The shape every locale dictionary must match.
 * Derived from the French reference above.
 */
export type Dictionary = typeof fr;