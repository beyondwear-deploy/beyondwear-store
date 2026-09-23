"use client";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CartSkeleton } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { formatPrice } from "@/lib/format";
import { useCartSummary } from "@/lib/hooks/useCartSummary";
import { useReady, useUI } from "@/store";
import { CartLineItem } from "./CartLineItem";
import { FreeShippingBar } from "./FreeShippingBar";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const ready = useReady();
  const s = useCartSummary();
  const close = () => setOpen(false);
  return (
    <Modal open={open} onClose={close} title={`Your bag${ready && s.count ? ` (${s.count})` : ""}`} variant="right">
      {!ready ? (
        <div className="p-5"><CartSkeleton /></div>
      ) : s.items.length === 0 ? (
        <div className="flex flex-1 items-center">
          <EmptyState icon={ShoppingBag} title="Your bag is empty" message="Every pair here is one-of-one — find something you love before it's gone." primary={{ label: "Start shopping", href: "/shop" }} />
        </div>
      ) : (
        <>
          <div className="border-b border-line px-5 py-4"><FreeShippingBar subtotal={s.subtotal} /></div>
          <ul className="flex-1 space-y-6 overflow-y-auto px-5 py-6">{s.items.map((l) => <CartLineItem key={l.product.id} line={l} onNavigate={close} />)}</ul>
          <div className="space-y-3 border-t border-line bg-elev px-5 py-5">
            <div className="flex items-baseline justify-between"><span className="text-sm text-muted">Subtotal</span><span className="text-xl font-bold tabular-nums">{formatPrice(s.subtotal)}</span></div>
            <p className="text-xs text-subtle">Delivery and promo codes are applied at checkout.</p>
            <Button href={s.hasIssues ? "/cart" : "/checkout"} onClick={close} size="lg" full arrow>{s.hasIssues ? "Review bag" : "Checkout"}</Button>
            <div className="flex justify-between text-xs">
              <Link href="/cart" onClick={close} className="link-underline font-semibold uppercase tracking-wider">View full bag</Link>
              <button type="button" onClick={close} className="link-underline font-semibold uppercase tracking-wider">Continue shopping</button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
