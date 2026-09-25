/**
 * SITE CONFIG — every business-specific value lives here.
 * Change the brand name, contact details, socials, delivery, promo codes and
 * sustainability numbers in this one file. (Colors live in src/styles/theme.css.)
 *
 * Nothing in this file is a secret. Secrets go in .env.local (see .env.example).
 */

export const siteConfig = {
  /** While true, demo content (reviews, Instagram tiles, art) is labelled as demo. */
  demoMode: true,
  /** Reference "today" for the demo catalogue so JUST IN badges stay stable. Remove in production. */
  catalogReferenceDate: "2026-09-20T00:00:00.000Z",

  brand: {
    name: "BeyondWear",
    legalName: "BeyondWear",
    tagline: "Beyond the first Wear",
    /** What the name means — used on the About page and in the footer. */
    meaning: "BeyondWear means going beyond fast fashion — giving great shoes a life beyond their first owner, and helping you dress beyond the everyday.",
    /** One-line brand story. */
    story: "Every great pair of shoes deserves to go beyond its first life, so we inspect, grade and honestly describe each one before it reaches your closet.",
    description:
      "Carefully selected preloved shoes in Pakistan — inspected, honestly graded, photographed in detail and delivered nationwide with Cash on Delivery.",
    domain: process.env.NEXT_PUBLIC_SITE_URL || "https://beyondwear.store",
  },

  contact: {
    whatsappNumber: "923422375002", // international format, digits only
    whatsappDisplay: "+92 342 2375002",
    email: "hello@beyondwear.store",
    phone: "+92 342 2375002",
    // Only a city was given (no street address) — shown as a general location, not a walk-in studio.
    address: ["Karachi, Pakistan"],
    hours: [
      { days: "Monday – Saturday", time: "11:00 – 19:00" },
      { days: "Sunday", time: "By appointment" },
    ],
    /** Paste your Google Maps embed URL here when ready. */
    mapEmbedUrl: "",
  },

  socials: {
    // Handles are planned, not yet claimed — confirm each one is yours before launch.
    instagram: { label: "Instagram", url: "https://instagram.com/beyondwear.store", handle: "@beyondwear.store" },
    facebook: { label: "Facebook", url: "https://facebook.com/beyondwear.store", handle: "/beyondwear.store" },
    tiktok: { label: "TikTok", url: "https://tiktok.com/@beyondwear.store", handle: "@beyondwear.store" },
    whatsapp: { label: "WhatsApp", url: "https://wa.me/923422375002", handle: "+92 342 2375002" },
  },

  currency: { code: "PKR", symbol: "Rs", locale: "en-PK" },

  announcement: [
    "Free delivery on orders over Rs 5,000",
    "Every pair inspected & photographed in detail",
    "Cash on Delivery available nationwide",
    "One-of-one pairs — once it's gone, it's gone",
  ],

  delivery: [
    { id: "standard", label: "Standard delivery", eta: "3–5 working days", price: 250, freeOver: 5000 },
    { id: "express", label: "Express delivery", eta: "1–2 working days (major cities)", price: 550, freeOver: null },
    { id: "pickup", label: "Studio pickup", eta: "Ready in 24 hours — by appointment", price: 0, freeOver: null },
  ] as const,

  /** Demo promo codes. In production these come from the `coupons` table. */
  promoCodes: [
    { code: "WELCOME10", type: "percent", value: 10, minSubtotal: 0, description: "10% off your order" },
    { code: "SECONDLIFE", type: "fixed", value: 500, minSubtotal: 4000, description: "Rs 500 off orders over Rs 4,000" },
    { code: "FREESHIP", type: "shipping", value: 0, minSubtotal: 0, description: "Free standard delivery" },
  ] as const,

  payments: {
    /**
     * off | demo — controls the Online Payment option (see lib/adapters/payments.ts).
     * Defaults to "off" so real customers are never shown a fake payment gateway.
     * Only set NEXT_PUBLIC_ONLINE_PAYMENTS=demo while you're testing the checkout
     * flow yourself — switch it back to "off" (or remove it) before real launch,
     * and only turn it "on" once a real gateway (Easypaisa/JazzCash/PayFast/etc.)
     * is actually wired up in lib/adapters/payments.ts.
     */
    onlineMode: (process.env.NEXT_PUBLIC_ONLINE_PAYMENTS as "off" | "demo" | undefined) ?? "off",
    /**
     * Manual transfer via mobile wallet / RAAST, since that's what's actually set up —
     * no traditional bank account yet. All four route to the same number.
     */
    bankTransfer: {
      label: "Mobile wallet transfer (RAAST / SadaPay / JazzCash / EasyPaisa)",
      number: "0342-2375002",
      services: ["RAAST", "SadaPay", "JazzCash", "EasyPaisa"],
      note: "Send the exact order total to the number above via RAAST, SadaPay, JazzCash or EasyPaisa, then share the payment screenshot on WhatsApp. Your order is confirmed once payment is verified.",
    },
    codFee: 0,
  },

  /**
   * Sustainability numbers. Keep these HONEST: only publish figures you can back up.
   * `source: "catalog"` values are computed live from the catalogue; `source: "config"`
   * values are edited here (or later from the admin panel).
   */
  sustainabilityStats: [
    { id: "listed", label: "Pairs given a second chapter", source: "catalog", value: 0, suffix: "" },
    { id: "checks", label: "Inspection checkpoints per pair", source: "config", value: 12, suffix: "" },
    { id: "photos", label: "Detail photos per pair", source: "config", value: 5, suffix: "" },
  ] as const,

  newsletter: { title: "Be first to every new pair." },

  seo: {
    titleTemplate: "%s | BeyondWear",
    defaultTitle: "BeyondWear — Preloved Shoes in Pakistan",
    ogImage: "/og.png",
  },
} as const;

export type DeliveryId = (typeof siteConfig.delivery)[number]["id"];

export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/men", label: "Men" },
  { href: "/women", label: "Women" },
  { href: "/kids", label: "Kids" },
  { href: "/coming-soon", label: "Coming Soon" },
  { href: "/about", label: "About" },
  { href: "/our-work", label: "Our Work" },
  { href: "/contact", label: "Contact" },
] as const;
