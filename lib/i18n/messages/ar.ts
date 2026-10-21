/**
 * Arabic UI messages — Modern Standard Arabic (Moroccan tourism register).
 *
 * The routing, RTL direction and layout already work for Arabic (see
 * `getDir()` in lib/i18n/config.ts); Morocco uses Western digits, which
 * matches the `ar-MA` Intl formats in lib/format.ts.
 *
 * Must match the exact structure of the French reference dictionary
 * (`fr.ts`) — the `Dictionary` type enforces it at compile time.
 * Labels are written to compose naturally where the UI interpolates
 * them (e.g. `{n} {maxPeople}`, `{from} {price} {currency} {perPerson}`).
 */
import type { Dictionary } from "./fr";

const ar: Dictionary = {
  meta: {
    description:
      "وكالة أسفار محلية في المغرب. رحلات مصمَّمة خصيصًا لاستكشاف الصحراء والمدن الإمبراطورية العريقة وجبال الأطلس.",
  },
  nav: {
    home: "الرئيسية",
    tours: "الرحلات",
    destinations: "الوجهات",
    blog: "المدونة",
    gallery: "معرض الصور",
    testimonials: "آراء المسافرين",
    faq: "الأسئلة الشائعة",
    about: "من نحن",
    contact: "اتصل بنا",
    book: "احجز",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    chooseLanguage: "اختر اللغة",
  },
  home: {
    hero: {
      badge: "وكالة أسفار محلية · مراكش",
      title: "عيشوا المغرب",
      titleAccent: "الأصيل",
      subtitle:
        "رحلات مصمَّمة حسب رغبتكم، ومرشدون محليون شغوفون، ولقاءات حقيقية — من كثبان مرزوكة الرملية إلى أزقة فاس العتيقة.",
      primaryCta: "اكتشفوا رحلاتنا",
      secondaryCta: "تواصلوا معنا",
      photoLabel: "صحراء مرزوكة",
    },
    trustBar: [
      { value: "15+", label: "سنة من الخبرة" },
      { value: "2 500+", label: "مساف رافقناهم" },
      { value: "4,9/5", label: "متوسط تقييم العملاء" },
    ],
    featured: {
      eyebrow: "رحلاتنا",
      title: "الرحلات الأكثر رواجًا",
      subtitle:
        "مختارات من أفضل رحلاتنا، مصمَّمة خصيصًا للمجموعات الصغيرة.",
      cta: "استعرضوا جميع الرحلات",
    },
    destinations: {
      eyebrow: "الوجهات",
      title: "إلى أين تريدون السفر؟",
      subtitle:
        "من صحراء مرزوكة إلى وديان الأطلس، استكشفوا الجهات التي نرافقكم إليها.",
      tourCountLabel: "{count} رحلة",
    },
    testimonials: {
      eyebrow: "آراء المسافرين",
      title: "تجارب من سافروا معنا",
      subtitle: "ثقة مسافرينا هي أصدق شهادة على جودة خدماتنا.",
      seeAll: "جميع الآراء",
    },
    cta: {
      title: "هل أنتم مستعدون لمغامرة لا تُنسى؟",
      subtitle: "حدثونا عن مشروع رحلتكم — نضمن لكم الرد خلال 24 ساعة.",
      primaryCta: "راسلونا عبر واتساب",
      secondaryCta: "اطلبوا عرض سعر",
    },
  },
  common: {
    from: "ابتداءً من",
    currency: "د.م.",
    perPerson: "للفرد",
    days: "أيام",
    day: "يوم",
    maxPeople: "شخصًا كحد أقصى",
    seatsLeft: "مقاعد متبقية",
    difficulty: {
      easy: "سهل",
      moderate: "متوسط",
      challenging: "شاق",
    },
  },
  tourDetail: {
    itineraryTitle: "برنامج الرحلة يومًا بيوم",
    dayLabel: "اليوم",
    includedTitle: "الخدمات المشمولة",
    excludedTitle: "الخدمات غير المشمولة",
    departuresTitle: "مواعيد المغادرة المبرمجة",
    departureLabel: "المغادرة",
    returnLabel: "العودة",
    departurePoint: "مكان المغادرة",
    returnPoint: "مكان العودة",
    noDepartures: "لا توجد مواعيد مغادرة مبرمجة حاليًا — تواصلوا معنا لتنظيم رحلتكم الخاصة.",
    bookCta: "احجزوا هذه الرحلة",
    askCta: "اطرحوا سؤالًا",
    otherTours: "رحلات أخرى تستحق الاستكشاف",
    whatsappOr: "أو تواصلوا مباشرة عبر",
  },
  destinationDetail: {
    toursTitle: "رحلاتنا في هذه المنطقة",
    noTours: "لا توجد رحلات في هذه المنطقة حاليًا.",
    backToDestinations: "جميع الوجهات",
  },
  pages: {
    tours: {
      title: "رحلاتنا",
      subtitle:
        "صحراء، ومدن إمبراطورية، وجبال، وساحل أطلسي — رحلات بمجموعات صغيرة يقودها مرشدون محليون.",
      empty: "لا توجد رحلات منشورة حاليًا. تفضلوا بزيارتنا قريبًا!",
    },
    destinations: {
      title: "الوجهات",
      subtitle:
        "من الصحراء إلى وديان الأطلس، اكتشفوا الجهات التي نرافقكم إليها.",
      empty: "لا توجد وجهات منشورة حاليًا.",
    },
    about: {
      title: "من نحن",
      subtitle:
        "وكالة محلية، وفريق شغوف، وهدف واحد: أن نجعلكم تحبون المغرب.",
      storyTitle: "حكايتنا",
      story: [
        "وُلدت وكالة أطلس فوياج في مراكش من قناعة بسيطة: المغرب يُعاش من الداخل. فمؤسسوها، وهم مرشدون جبليون منذ القدم، أرادوا إنشاء وكالة بقياس إنساني تُصمَّم فيها كل رحلة يدًا بيد مع المسافرين.",
        "واليوم، ينظّم فريقنا المكوَّن من مرشدين وسائقين وطباخين أمازيغ عشرات الرحلات كل سنة — من صحراء مرزوكة إلى شلالات أوزود — دائمًا بمجموعات صغيرة لا تتجاوز اثني عشر شخصًا.",
      ],
      valuesTitle: "قيمنا",
      values: [
        {
          title: "الأصالة",
          description:
            "نبيت عند الأهالي، ونأكل في الأسواق الشعبية، ونأخذكم إلى أماكن لا يصل إليها المسافرون بمفردهم.",
        },
        {
          title: "مجموعات صغيرة",
          description:
            "اثنا عشر شخصًا كحد أقصى: الحجم المثالي للقاءات حقيقية وتنظيم مريح بلا تعقيد.",
        },
        {
          title: "مرشدون محليون",
          description:
            "وُلد مرشدونا في الجهات التي يعرّفونكم بها — فكل كثيب رملي وكل زقاق يحمل حكاية.",
        },
      ],
    },
    contact: {
      title: "اتصلوا بنا",
      subtitle: "حدثونا عن مشروع رحلتكم — نضمن لكم الرد خلال 24 ساعة.",
      phoneTitle: "الهاتف",
      emailTitle: "البريد الإلكتروني",
      addressTitle: "العنوان",
      hoursTitle: "أوقات العمل",
      hours: "من الاثنين إلى السبت، 9:00–19:00 (GMT+1)",
      socialTitle: "تابعونا",
      whatsappCta: "راسلونا عبر واتساب",
      quoteCta: "اطلبوا عرض سعر",
      formNotice:
        "استمارة الطلب الإلكترونية قادمة قريبًا — إلى ذلك الحين، راسلونا عبر واتساب أو البريد الإلكتروني.",
    },
    blog: {
      title: "المدونة",
      subtitle: "نصائح للتحضير، ويوميات رحلات، وكواليس الوكالة.",
      empty: "لا توجد مقالات منشورة حاليًا.",
      readMore: "اقرأوا المقال",
      backToBlog: "العودة إلى المدونة",
    },
    gallery: {
      title: "معرض الصور",
      subtitle: "لمحة عن المناظر الطبيعية واللقاءات التي تنتظركم.",
      empty: "لا توجد صور منشورة حاليًا.",
      destinationsLabel: "مناطقنا",
      toursLabel: "رحلاتنا",
    },
    testimonials: {
      title: "آراء المسافرين",
      subtitle: "ثقة مسافرينا هي أصدق شهادة على جودة خدماتنا.",
      empty: "لا توجد آراء منشورة حاليًا.",
      averageLabel: "متوسط التقييم",
      ratingSuffix: "/5",
    },
    faq: {
      title: "الأسئلة الشائعة",
      subtitle: "كل ما تحتاجون معرفته قبل السفر معنا.",
      empty: "لا توجد أسئلة منشورة حاليًا.",
    },
  },
  forms: {
    submitting: "جارٍ الإرسال…",
    booking: {
      title: "احجزوا هذه الرحلة",
      subtitle:
        "املؤوا هذا النموذج — نضمن لكم الرد خلال 24 ساعة. لا يوجد أي دفع إلكتروني: نؤكد توفر المقاعد قبل أي التزام.",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "الهاتف (اختياري)",
      departure: "المغادرة المفضلة",
      flexible: "تاريخ مرن — يُتفق عليه",
      travelDate: "أو التاريخ المطلوب",
      adults: "البالغون",
      children: "الأطفال",
      message: "رسالة (اختياري)",
      submit: "أرسلوا الطلب",
      successTitle: "تم إرسال الطلب!",
      success:
        "شكرًا لكم! تم إرسال طلبكم بنجاح — سنعود إليكم خلال 24 ساعة.",
    },
    inquiry: {
      title: "اكتبوا لنا",
      subtitle: "هل لديكم سؤال أو مشروع رحلة خاصة؟ أرسلوا لنا رسالة.",
      name: "الاسم",
      email: "البريد الإلكتروني",
      subject: "الموضوع",
      message: "الرسالة",
      submit: "أرسلوا الرسالة",
      successTitle: "تم إرسال الرسالة!",
      success:
        "شكرًا لكم! تم إرسال رسالتكم بنجاح — سنرد عليكم خلال 24 ساعة.",
    },
  },
  loading: "جارٍ التحميل…",
  error: {
    title: "حدث خطأ",
    description:
      "نعتذر، لقد وقع خطأ غير متوقع. حاولوا مجددًا بعد لحظات.",
    retry: "إعادة المحاولة",
  },
  footer: {
    tagline:
      "وكالة أسفار محلية تُنصت إليكم وتصمم لكم رحلات خاصة في ربوع المغرب.",
    contactTitle: "التواصل",
    linksTitle: "روابط سريعة",
    followTitle: "تابعونا",
    rights: "جميع الحقوق محفوظة.",
  },
  notFound: {
    title: "الصفحة غير موجودة",
    description: "نعتذر، الصفحة التي تبحثون عنها غير موجودة أو تم نقلها.",
    cta: "العودة إلى الرئيسية",
  },
};

export default ar;