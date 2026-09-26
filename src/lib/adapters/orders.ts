/**
 * ORDER SERVICE. Stock/availability is still tracked locally (useOrders'
 * soldCounts, from src/store) — good enough for this store's volume — but
 * every placed order is now also persisted to the database (see
 * persistOrder() below and supabase/schema.sql) so it shows up in the
 * admin dashboard's business analytics and survives across devices/browsers.
 * A fully atomic, race-proof stock decrement would move this into a
 * database transaction/RPC instead — see supabase/schema-future-catalog-migration.sql
 * for a drafted design if the catalogue itself ever moves into the database.
 */
import { getProductById } from "@/lib/catalog";
import { siteConfig } from "@/lib/config";
import { computeTotals } from "@/lib/pricing";
import type { DeliveryId } from "@/lib/config";
import type { Order, OrderStatus, PaymentMethodId } from "@/lib/types";
import { availableOf, useCart, useOrders } from "@/store";

export class OutOfStockError extends Error {
  constructor(public items: string[]) {
    super("Some items are no longer available");
  }
}

export interface CheckoutInput {
  customer: Order["customer"];
  shipping: Order["shipping"];
  delivery: DeliveryId;
  payment: PaymentMethodId;
  paymentStatus: Order["paymentStatus"];
  userId?: string;
}

const genId = () => "SEQ-" + Math.random().toString(36).slice(2, 8).toUpperCase();

/** Verifies stock again at the last moment (another shopper may have bought a one-of-one). */
export function unavailableInCart(): string[] {
  const { lines } = useCart.getState();
  const sold = useOrders.getState().soldCounts;
  const bad: string[] = [];
  for (const l of lines) {
    const p = getProductById(l.productId);
    if (!p || availableOf(p, sold) < l.qty) bad.push(p ? `${p.brand} ${p.name}` : l.productId);
  }
  return bad;
}

export function placeOrder(input: CheckoutInput): Order {
  const bad = unavailableInCart();
  if (bad.length) throw new OutOfStockError(bad);
  const { lines, promo } = useCart.getState();
  const items = lines.map((l) => {
    const p = getProductById(l.productId)!;
    return { productId: p.id, name: p.name, brand: p.brand, size: p.size, color: p.color, condition: p.condition, price: p.price, qty: l.qty, slug: p.slug };
  });
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const t = computeTotals(subtotal, input.delivery, promo);
  const order: Order = {
    id: genId(),
    placedAt: new Date().toISOString(),
    customer: input.customer,
    shipping: input.shipping,
    deliveryMethod: input.delivery,
    paymentMethod: input.payment,
    paymentStatus: input.paymentStatus,
    items,
    subtotal,
    discount: t.discount,
    deliveryFee: t.deliveryFee,
    total: t.total,
    promoCode: t.promo && t.promo.ok ? t.promo.code : undefined,
    userId: input.userId,
  };
  useOrders.getState().addOrder(order);
  useCart.getState().clear();
  notifyOrderPlaced(order);
  persistOrder(order);
  return order;
}

/**
 * Emails the order to you (fire-and-forget) — kept as a backup copy even
 * now that orders are persisted to the database below. Never blocks or
 * fails checkout if it errors.
 */
function notifyOrderPlaced(order: Order): void {
  try {
    fetch("/api/order-notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) }).catch(() => {});
  } catch {
    // never let a notification failure affect checkout
  }
}

/**
 * Saves the order to the real database (Supabase) so it shows up in the
 * admin dashboard's business/sales analytics. Fire-and-forget: if the
 * database isn't connected yet, this silently no-ops and the order still
 * exists locally (localStorage) and in the notification email.
 */
function persistOrder(order: Order): void {
  try {
    fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) }).catch(() => {});
  } catch {
    // never let a persistence failure affect checkout
  }
}

/* ------------------------------ tracking ------------------------------ */
const ORDER: OrderStatus[] = ["placed", "confirmed", "packed", "shipped", "out-for-delivery", "delivered"];
/** DEMO: minutes after placement at which each stage is reached. A real backend stores actual statuses. */
const DEMO_THRESHOLDS = [0, 0.5, 2, 4, 6, 9];

export function statusOf(o: Order, now = Date.now()): { status: OrderStatus; index: number } {
  if (o.statusOverride) return { status: o.statusOverride, index: ORDER.indexOf(o.statusOverride) };
  const mins = (now - new Date(o.placedAt).getTime()) / 60000 + (o.ageOffsetMin ?? 0);
  let idx = 0;
  DEMO_THRESHOLDS.forEach((t, i) => { if (mins >= t) idx = i; });
  return { status: ORDER[idx], index: idx };
}

/** Seeded so the tracking page can be tried without placing an order. */
export const DEMO_ORDERS: Order[] = [
  {
    id: "SEQ-DEMO01",
    placedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    customer: { fullName: "Demo Customer", phone: "0300 0000000", email: "demo@example.com" },
    shipping: { fullName: "Demo Customer", phone: "0300 0000000", address: "House 1, Street 2, Block 3", city: "Karachi", province: "Sindh", postalCode: "75500" },
    deliveryMethod: "standard",
    paymentMethod: "cod",
    paymentStatus: "pending",
    items: [
      { productId: "p001", name: "Air Max Trainers", brand: "Nike", size: "UK 9", color: "Black", condition: "excellent", price: 14500, qty: 1, slug: "nike-air-max-trainers-black-size-9" },
    ],
    subtotal: 14500, discount: 0, deliveryFee: 0, total: 14500,
    statusOverride: "shipped",
  },
];

export function findOrder(id: string, contact: string, all: Order[]): Order | undefined {
  const c = contact.trim().toLowerCase();
  const digits = c.replace(/\D/g, "");
  return [...all, ...DEMO_ORDERS].find(
    (o) =>
      o.id.toLowerCase() === id.trim().toLowerCase() &&
      (o.customer.email.toLowerCase() === c || (digits.length >= 6 && o.customer.phone.replace(/\D/g, "").endsWith(digits.slice(-7)))),
  );
}

export const deliveryLabel = (id: string) => siteConfig.delivery.find((d) => d.id === id)?.label ?? id;
