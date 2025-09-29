export type Lang = "fa" | "en" | "ar";

export const dict = {
  fa: {
    brand: "کلینیک کوشا",
    nav: { home: "خانه", services: "خدمات", doctors: "پزشکان", news: "اخبار", appointment: "رزرو نوبت", contact: "تماس" },
    hero: {
      title: "به کوشا خوش آمدید",
      lead: "کلینیک هوشمند با تیم متخصص؛ نوبت‌دهی آنلاین، پرونده الکترونیک و خدمات جامع توان‌بخشی.",
      cta1: "رزرو نوبت", cta2: "خدمات"
    },
    home: { services: "خدمات پرمراجعه", news: "خبرها و مقالات" },
    footer: { privacy: "حریم خصوصی", about: "درباره", faq: "سوالات متداول", rights: "همهٔ حقوق محفوظ است." },
    contact: { title: "ارتباط با ما", phone: "تلفن", message: "پیام شما" }
  },
  en: {
    brand: "Koosha Clinic",
    nav: { home: "Home", services: "Services", doctors: "Doctors", news: "News", appointment: "Book", contact: "Contact" },
    hero: {
      title: "Welcome to Koosha",
      lead: "Smart clinic with online booking, EHR and complete rehab services.",
      cta1: "Book now", cta2: "Services"
    },
    home: { services: "Popular services", news: "News & Articles" },
    footer: { privacy: "Privacy", about: "About", faq: "FAQ", rights: "All rights reserved." },
    contact: { title: "Contact us", phone: "Phone", message: "Your message" }
  },
  ar: {
    brand: "عيادة كوشا",
    nav: { home: "الرئيسية", services: "الخدمات", doctors: "الأطباء", news: "الأخبار", appointment: "حجز", contact: "اتصال" },
    hero: {
      title: "مرحباً بكم في كوشا",
      lead: "عيادة ذكية بحجز إلكتروني وملف طبي وخدمات تأهيل شاملة.",
      cta1: "احجز الآن", cta2: "الخدمات"
    },
    home: { services: "الخدمات الأكثر طلباً", news: "الأخبار والمقالات" },
    footer: { privacy: "الخصوصية", about: "من نحن", faq: "الأسئلة الشائعة", rights: "جميع الحقوق محفوظة." },
    contact: { title: "تواصل معنا", phone: "الهاتف", message: "رسالتك" }
  }
} as const;

export const t = (lang: Lang) => dict[lang];
