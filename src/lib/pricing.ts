import { siteConfig, type DeliveryId } from "./config";

export type PromoResult =
  | { ok: true; code: string; description: string; discount: number; freeShipping: boolean }
  | { ok: false; message: string };

export function validatePromo(codeRaw: string, subtotal: number): PromoResult {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return { ok: false, message: "Enter a promo code." };
  const promo = siteConfig.promoCodes.find((p) => p.code === code);
  if (!promo) return { ok: false, message: "That code isn't valid. Check the spelling and try again." };
  if (subtotal < promo.minSubtotal)
    return { ok: false, message: `This code needs a minimum order of ${siteConfig.currency.symbol} ${promo.minSubtotal.toLocaleString()}.` };
  let discount = 0;
  if (promo.type === "percent") discount = Math.round((subtotal * promo.value) / 100);
  if (promo.type === "fixed") discount = Math.min(promo.value, subtotal);
  return { ok: true, code, description: promo.description, discount, freeShipping: promo.type === "shipping" };
}

export function deliveryFee(id: DeliveryId, subtotal: number, freeShippingPromo = false): number {
  const m = siteConfig.delivery.find((d) => d.id === id)!;
  if (subtotal === 0) return 0;
  if (id === "standard" && freeShippingPromo) return 0;
  if (m.freeOver !== null && subtotal >= m.freeOver) return 0;
  return m.price;
}

export function computeTotals(subtotal: number, delivery: DeliveryId, promoCode: string | null) {
  const promo = promoCode ? validatePromo(promoCode, subtotal) : null;
  const discount = promo && promo.ok ? promo.discount : 0;
  const fee = deliveryFee(delivery, subtotal - discount, promo && promo.ok ? promo.freeShipping : false);
  const codFee = 0;
  return { discount, deliveryFee: fee, total: Math.max(0, subtotal - discount + fee + codFee), promo };
}
