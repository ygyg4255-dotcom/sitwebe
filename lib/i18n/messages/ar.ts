/**
 * Arabic UI messages — PLACEHOLDER.
 *
 * TODO(translation): the strings below are still the French reference text.
 * The routing, RTL direction and layout already work for Arabic (see
 * `getDir()` in lib/i18n/config.ts) — real translations are added when
 * Arabic content is scheduled.
 *
 * Must match the exact structure of the French reference dictionary
 * (`fr.ts`) — the `Dictionary` type enforces it at compile time.
 */
import type { Dictionary } from "./fr";

const ar: Dictionary = {
  meta: {
    description:
      "Agence de voyages locale au Maroc. Circuits sur mesure, désert du Sahara, médinas impériales et montagnes de l'Atlas.",
  },
  nav: {
    home: "Accueil",
    tours: "Circuits",
    destinations: "Destinations",
    blog: "Blog",
    gallery: "Galerie",
    testimonials: "Avis",
    faq: "FAQ",
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
      seeAll: "Tous les avis",
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
    day: "jour",
    maxPeople: "pers. max",
    seatsLeft: "places restantes",
    difficulty: {
      easy: "Facile",
      moderate: "Modéré",
      challenging: "Sportif",
    },
  },
  tourDetail: {
    itineraryTitle: "Itinéraire jour par jour",
    dayLabel: "Jour",
    includedTitle: "Ce qui est inclus",
    excludedTitle: "Non inclus",
    departuresTitle: "Départs programmés",
    departureLabel: "Départ",
    returnLabel: "Retour",
    departurePoint: "Lieu de départ",
    returnPoint: "Lieu de retour",
    noDepartures: "Aucun départ programmé pour le moment — contactez-nous pour organiser le vôtre.",
    bookCta: "Réserver ce circuit",
    askCta: "Poser une question",
    otherTours: "D'autres circuits à découvrir",
    // TODO(i18n-ar): French placeholder — replace with real Arabic.
    whatsappOr: "Ou échangez directement via",
  },
  destinationDetail: {
    toursTitle: "Nos circuits dans cette région",
    noTours: "Aucun circuit dans cette région pour le moment.",
    backToDestinations: "Toutes les destinations",
  },
  pages: {
    tours: {
      title: "Nos circuits",
      subtitle:
        "Désert, villes impériales, montagnes et côte atlantique — des voyages en petits groupes, menés par des guides locaux.",
      empty: "Aucun circuit n'est publié pour le moment. Revenez bientôt !",
    },
    destinations: {
      title: "Destinations",
      subtitle:
        "Du Sahara aux vallées de l'Atlas, découvrez les régions où nous vous emmenons.",
      empty: "Aucune destination n'est publiée pour le moment.",
    },
    about: {
      title: "À propos",
      subtitle:
        "Une agence locale, une équipe passionnée, un objectif : vous faire aimer le Maroc.",
      storyTitle: "Notre histoire",
      story: [
        "Atlas Voyages est née à Marrakech d'une conviction simple : le Maroc se vit de l'intérieur. Nos fondateurs, guides de montagne depuis toujours, ont voulu créer une agence à taille humaine où chaque voyage est conçu main dans la main avec les voyageurs.",
        "Aujourd'hui, notre équipe de guides, chauffeurs et cuisiniers berbères orchestre des dizaines de circuits chaque année — du désert de Merzouga aux cascades d'Ouzoud — toujours en petits groupes, jamais plus de douze personnes.",
      ],
      valuesTitle: "Nos valeurs",
      values: [
        {
          title: "Authenticité",
          description:
            "Nous dormons chez l'habitant, mangeons dans les souks et vous emmenons là où les voyageurs ne vont pas seuls.",
        },
        {
          title: "Petits groupes",
          description:
            "Douze personnes maximum : la taille juste pour des rencontres vraies et une logistique sans stress.",
        },
        {
          title: "Guides locaux",
          description:
            "Nos guides sont nés dans les régions qu'ils vous font découvrir — chaque dune, chaque ruelle a une histoire.",
        },
      ],
    },
    contact: {
      title: "Contact",
      subtitle:
        "Parlons de votre projet de voyage — réponse garantie sous 24 h.",
      phoneTitle: "Téléphone",
      emailTitle: "E-mail",
      addressTitle: "Adresse",
      hoursTitle: "Horaires",
      hours: "Lundi–Samedi, 9 h–19 h (GMT+1)",
      socialTitle: "Suivez-nous",
      whatsappCta: "Écrire sur WhatsApp",
      quoteCta: "Demander un devis",
      formNotice:
        "Notre formulaire de demande en ligne arrive bientôt — en attendant, écrivez-nous sur WhatsApp ou par e-mail.",
    },
    blog: {
      title: "Blog",
      subtitle:
        "Conseils de préparation, carnets de voyage et coulisses de l'agence.",
      empty: "Aucun article n'est publié pour le moment.",
      readMore: "Lire l'article",
      backToBlog: "Retour au blog",
    },
    gallery: {
      title: "Galerie",
      subtitle: "Un aperçu des paysages et des rencontres qui vous attendent.",
      empty: "Aucune image n'est publiée pour le moment.",
      destinationsLabel: "Nos régions",
      toursLabel: "Nos circuits",
    },
    testimonials: {
      title: "Avis voyageurs",
      subtitle:
        "La confiance de nos voyageurs est notre meilleure carte de visite.",
      empty: "Aucun avis n'est publié pour le moment.",
      averageLabel: "Note moyenne",
      ratingSuffix: "/5",
    },
    faq: {
      title: "Questions fréquentes",
      subtitle: "Tout ce qu'il faut savoir avant de partir avec nous.",
      empty: "Aucune question n'est publiée pour le moment.",
    },
  },
  forms: {
    submitting: "Envoi en cours…",
    booking: {
      title: "Réserver ce circuit",
      subtitle:
        "Remplissez ce formulaire — réponse garantie sous 24 h. Aucun paiement en ligne : nous confirmons la disponibilité avant tout engagement.",
      fullName: "Nom complet",
      email: "E-mail",
      phone: "Téléphone (facultatif)",
      departure: "Départ souhaité",
      flexible: "Date flexible — à convenir",
      travelDate: "Ou date souhaitée",
      adults: "Adultes",
      children: "Enfants",
      message: "Message (facultatif)",
      submit: "Envoyer la demande",
      successTitle: "Demande envoyée !",
      success:
        "Merci ! Votre demande a bien été envoyée — nous revenons vers vous sous 24 h.",
    },
    inquiry: {
      title: "Écrivez-nous",
      subtitle: "Une question, un projet sur mesure ? Envoyez-nous un message.",
      name: "Nom",
      email: "E-mail",
      subject: "Sujet",
      message: "Message",
      submit: "Envoyer le message",
      successTitle: "Message envoyé !",
      success:
        "Merci ! Votre message a bien été envoyé — nous vous répondons sous 24 h.",
    },
  },
  loading: "Chargement…",
  error: {
    title: "Une erreur est survenue",
    description:
      "Désolé, une erreur inattendue s'est produite. Réessayez dans un instant.",
    retry: "Réessayer",
  },
  footer: {
    tagline:
      "Agence de voyages locale, à l'écoute, créatrice de circuits sur mesure au Maroc.",
    contactTitle: "Contact",
    linksTitle: "Liens rapides",
    followTitle: "Suivez-nous",
    rights: "Tous droits réservés.",
  },
  notFound: {
    title: "Page introuvable",
    description: "Désolé, la page que vous cherchez n'existe pas ou a été déplacée.",
    cta: "Retour à l'accueil",
  },
};

export default ar;