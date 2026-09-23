"use client";
import { useMemo } from "react";
import { getProductById } from "@/lib/catalog";
import type { DeliveryId } from "@/lib/config";
import { computeTotals } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { availableOf, useCart, useOrders } from "@/store";

export interface ResolvedLine { product: Product; qty: number; avail: number; issue: "sold-out" | "reduced" | null }

export function useCartSummary(delivery: DeliveryId = "standard") {
  const lines = useCart((s) => s.lines);
  const promo = useCart((s) => s.promo);
  const sold = useOrders((s) => s.soldCounts);
  return useMemo(() => {
    const items: ResolvedLine[] = lines.flatMap((l) => {
      const product = getProductById(l.productId);
      if (!product) return [];
      const avail = availableOf(product, sold);
      return [{ product, qty: l.qty, avail, issue: avail <= 0 ? ("sold-out" as const) : avail < l.qty ? ("reduced" as const) : null }];
    });
    const subtotal = items.filter((i) => !i.issue).reduce((s, i) => s + i.product.price * i.qty, 0);
    const count = items.reduce((n, i) => n + i.qty, 0);
    const totals = computeTotals(subtotal, delivery, promo);
    return { items, count, subtotal, hasIssues: items.some((i) => i.issue), promoCode: promo, ...totals };
  }, [lines, promo, sold, delivery]);
}
