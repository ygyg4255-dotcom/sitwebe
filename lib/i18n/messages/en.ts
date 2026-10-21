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
    blog: "Blog",
    gallery: "Gallery",
    testimonials: "Reviews",
    faq: "FAQ",
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
      photoLabel: "Merzouga Desert",
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
      seeAll: "All reviews",
    },
    cta: {
      title: "Ready for an unforgettable adventure?",
      subtitle:
        "Tell us about your travel plans — guaranteed reply within 24 hours.",
      primaryCta: "Write on WhatsApp",
      secondaryCta: "Request a quote",
    },
  },
  common: {
    from: "from",
    currency: "MAD",
    perPerson: "/ person",
    days: "days",
    day: "day",
    maxPeople: "people max",
    seatsLeft: "seats left",
    difficulty: {
      easy: "Easy",
      moderate: "Moderate",
      challenging: "Challenging",
    },
  },
  tourDetail: {
    itineraryTitle: "Day-by-day itinerary",
    dayLabel: "Day",
    includedTitle: "What's included",
    excludedTitle: "Not included",
    departuresTitle: "Scheduled departures",
    departureLabel: "Departure",
    returnLabel: "Return",
    departurePoint: "Departure point",
    returnPoint: "Return point",
    noDepartures:
      "No scheduled departures yet — contact us to arrange yours.",
    bookCta: "Book this tour",
    askCta: "Ask a question",
    otherTours: "More tours to discover",
    whatsappOr: "Or talk to us directly on",
  },
  destinationDetail: {
    toursTitle: "Our tours in this region",
    noTours: "No tours in this region yet.",
    backToDestinations: "All destinations",
  },
  pages: {
    tours: {
      title: "Our tours",
      subtitle:
        "Desert, imperial cities, mountains and the Atlantic coast — small-group trips led by local guides.",
      empty: "No tours are published yet. Come back soon!",
    },
    destinations: {
      title: "Destinations",
      subtitle:
        "From the Sahara to the Atlas valleys, discover the regions we take you to.",
      empty: "No destinations are published yet.",
    },
    about: {
      title: "About us",
      subtitle:
        "A local agency, a passionate team, one goal: make you fall in love with Morocco.",
      storyTitle: "Our story",
      story: [
        "Atlas Voyages was born in Marrakech from a simple belief: Morocco should be experienced from the inside. Our founders, lifelong mountain guides, wanted to build a human-sized agency where every trip is designed hand in hand with the travelers.",
        "Today our team of guides, drivers and Berber cooks runs dozens of tours every year — from the Merzouga desert to the Ouzoud falls — always in small groups, never more than twelve people.",
      ],
      valuesTitle: "Our values",
      values: [
        {
          title: "Authenticity",
          description:
            "We sleep in family homes, eat in the souks and take you where travelers don't go alone.",
        },
        {
          title: "Small groups",
          description:
            "Twelve people maximum: the right size for genuine encounters and stress-free logistics.",
        },
        {
          title: "Local guides",
          description:
            "Our guides were born in the regions they show you — every dune, every alley has a story.",
        },
      ],
    },
    contact: {
      title: "Contact",
      subtitle: "Let's talk about your travel plans — guaranteed reply within 24 hours.",
      phoneTitle: "Phone",
      emailTitle: "Email",
      addressTitle: "Address",
      hoursTitle: "Opening hours",
      hours: "Monday–Saturday, 9 am–7 pm (GMT+1)",
      socialTitle: "Follow us",
      whatsappCta: "Write on WhatsApp",
      quoteCta: "Request a quote",
      formNotice:
        "Our online inquiry form is coming soon — in the meantime, reach us on WhatsApp or by email.",
    },
    blog: {
      title: "Blog",
      subtitle: "Preparation tips, travel journals and behind-the-scenes stories.",
      empty: "No articles are published yet.",
      readMore: "Read the article",
      backToBlog: "Back to the blog",
    },
    gallery: {
      title: "Gallery",
      subtitle: "A glimpse of the landscapes and encounters awaiting you.",
      empty: "No images are published yet.",
      destinationsLabel: "Our regions",
      toursLabel: "Our tours",
    },
    testimonials: {
      title: "Traveler reviews",
      subtitle: "Our travelers' trust is our best calling card.",
      empty: "No reviews are published yet.",
      averageLabel: "Average rating",
      ratingSuffix: "/5",
    },
    faq: {
      title: "Frequently asked questions",
      subtitle: "Everything you need to know before traveling with us.",
      empty: "No questions are published yet.",
    },
  },
  forms: {
    submitting: "Sending…",
    booking: {
      title: "Book this tour",
      subtitle:
        "Fill in this form — guaranteed reply within 24 hours. No online payment: we confirm availability before anything else.",
      fullName: "Full name",
      email: "Email",
      phone: "Phone (optional)",
      departure: "Preferred departure",
      flexible: "Flexible date — to be arranged",
      travelDate: "Or preferred date",
      adults: "Adults",
      children: "Children",
      message: "Message (optional)",
      submit: "Send request",
      successTitle: "Request sent!",
      success:
        "Thank you! Your request has been sent — we will get back to you within 24 hours.",
    },
    inquiry: {
      title: "Write to us",
      subtitle: "A question, a tailor-made project? Send us a message.",
      name: "Name",
      email: "Email",
      subject: "Subject",
      message: "Message",
      submit: "Send message",
      successTitle: "Message sent!",
      success:
        "Thank you! Your message has been sent — we will reply within 24 hours.",
    },
  },
  loading: "Loading…",
  error: {
    title: "Something went wrong",
    description:
      "Sorry, an unexpected error occurred. Please try again in a moment.",
    retry: "Try again",
  },
  footer: {
    tagline:
      "Local travel agency, attentive and creative, crafting tailor-made tours in Morocco.",
    contactTitle: "Contact",
    linksTitle: "Quick links",
    followTitle: "Follow us",
    rights: "All rights reserved.",
  },
  notFound: {
    title: "Page not found",
    description: "Sorry, the page you are looking for does not exist or has been moved.",
    cta: "Back to home",
  },
};

export default en;