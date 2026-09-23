"use client";
import { AlertTriangle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CartSkeleton } from "@/components/ui/LoadingState";
import { useCartSummary } from "@/lib/hooks/useCartSummary";
import { useCheckout, useReady } from "@/store";
import { CartLineItem } from "./CartLineItem";
import { DeliveryPicker } from "./DeliveryPicker";
import { FreeShippingBar } from "./FreeShippingBar";
import { TotalsRows } from "./OrderSummary";
import { PromoField } from "./PromoField";

export function CartPageClient() {
  const ready = useReady();
  const delivery = useCheckout((s) => s.delivery);
  const patch = useCheckout((s) => s.patch);
  const s = useCartSummary(delivery);
  const freeShip = !!(s.promo && s.promo.ok && s.promo.freeShipping);

  return (
    <div className="container-x pb-10 pt-6 sm:pt-8">
      <Breadcrumbs items={[{ label: "Bag" }]} />
      <h1 className="mb-8 mt-6 text-5xl sm:text-6xl">Your bag{ready && s.count > 0 && <span className="ml-3 align-middle text-2xl text-muted">({s.count})</span>}</h1>

      {!ready ? (
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]"><CartSkeleton /><div className="skeleton h-96 rounded-3xl" /></div>
      ) : s.items.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Your bag is empty" message="Every pair here is one-of-one. Browse the collection and add anything you love." primary={{ label: "Start shopping", href: "/shop" }} secondary={{ label: "New arrivals", href: "/new-arrivals" }} />
      ) : (
        <div className="grid items-start gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <div>
            {s.hasIssues && (
              <div role="alert" className="mb-6 flex gap-3 rounded-2xl bg-danger-soft p-4 text-sm text-danger"><AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden /><p>Some items in your bag are no longer available. Remove them to continue to checkout.</p></div>
            )}
            <ul className="divide-y divide-line [&>li]:py-6 first:[&>li]:pt-0">{s.items.map((l) => <CartLineItem key={l.product.id} line={l} />)}</ul>
            <Link href="/shop" className="link-underline mt-4 inline-block text-xs font-bold uppercase tracking-[0.14em]">← Continue shopping</Link>
          </div>

          <aside aria-label="Order summary" className="space-y-6 rounded-3xl border border-line bg-elev p-6 sm:p-8 lg:sticky lg:top-28">
            <h2 className="text-2xl">Order summary</h2>
            <FreeShippingBar subtotal={s.subtotal} />
            <PromoField subtotal={s.subtotal} />
            <div>
              <h3 className="mb-3 !font-sans text-xs font-bold uppercase !tracking-[0.14em] text-muted">Delivery</h3>
              <DeliveryPicker value={delivery} onChange={(d) => patch({ delivery: d })} subtotal={s.subtotal - s.discount} freeShippingPromo={freeShip} />
            </div>
            <TotalsRows s={s} />
            {s.hasIssues ? <Button size="lg" full disabled>Checkout</Button> : <Button href="/checkout" size="lg" full arrow>Checkout</Button>}
            <p className="text-center text-xs text-subtle">Cash on Delivery · Bank Transfer · Online Payment</p>
          </aside>
        </div>
      )}
    </div>
  );
}
