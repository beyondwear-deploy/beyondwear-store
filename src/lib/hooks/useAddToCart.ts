"use client";
import { useCallback } from "react";
import type { Product } from "@/lib/types";
import { useCart, useUI } from "@/store";

/** Adds a product to the bag with correct one-of-one feedback (toast + icon bump). */
export function useAddToCart() {
  const add = useCart((s) => s.add);
  const toast = useUI((s) => s.toast);
  const bump = useUI((s) => s.bump);
  const setCartOpen = useUI((s) => s.setCartOpen);
  return useCallback(
    (p: Product, opts?: { openDrawer?: boolean; silent?: boolean }) => {
      const r = add(p);
      if (r === "added") {
        bump();
        if (opts?.openDrawer) setCartOpen(true);
        else if (!opts?.silent)
          toast({ kind: "success", title: "Added to your bag", message: `${p.brand} ${p.name} · ${p.size}`, action: { label: "View bag", onClick: () => setCartOpen(true) } });
      } else if (r === "in-cart") {
        toast({ kind: "info", title: "Already in your bag", message: "This is a one-of-one pair — only 1 available." , action: { label: "View bag", onClick: () => setCartOpen(true) } });
      } else {
        toast({ kind: "error", title: "Sold out", message: "Sorry — someone got to this pair first." });
      }
      return r;
    },
    [add, toast, bump, setCartOpen],
  );
}
