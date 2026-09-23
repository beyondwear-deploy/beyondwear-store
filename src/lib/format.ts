import { siteConfig } from "./config";
import type { Condition, OrderStatus } from "./types";

export function formatPrice(n: number): string {
  const { symbol, locale } = siteConfig.currency;
  return `${symbol} ${Math.round(n).toLocaleString(locale)}`;
}

export function discountPercent(price: number, original?: number): number | null {
  if (!original || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

export const CONDITIONS: {
  id: Condition;
  label: string;
  short: string;
  description: string;
  rank: number;
}[] = [
  { id: "new", label: "New / Unused", short: "New", description: "Never worn or unused. May still have original tags.", rank: 5 },
  { id: "like-new", label: "Like New", short: "Like New", description: "Almost no visible signs of use.", rank: 4 },
  { id: "excellent", label: "Excellent", short: "Excellent", description: "Very minor signs of previous use.", rank: 3 },
  { id: "good", label: "Good", short: "Good", description: "Visible but acceptable signs of wear.", rank: 2 },
  { id: "fair", label: "Fair", short: "Fair", description: "Noticeable wear but still functional and wearable.", rank: 1 },
];

export const conditionMeta = (c: Condition) => CONDITIONS.find((x) => x.id === c)!;

export const ORDER_STEPS: { id: OrderStatus; label: string; hint: string }[] = [
  { id: "placed", label: "Order placed", hint: "We've received your order." },
  { id: "confirmed", label: "Confirmed", hint: "Your order is confirmed and reserved." },
  { id: "packed", label: "Packed", hint: "Inspected, cleaned and carefully packed." },
  { id: "shipped", label: "Shipped", hint: "Handed to our courier partner." },
  { id: "out-for-delivery", label: "Out for delivery", hint: "Your parcel is on its way to you." },
  { id: "delivered", label: "Delivered", hint: "Delivered. Enjoy your new pair." },
];

export function formatDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
