"use client";
import Link from "next/link";
import { deliveryLabel } from "@/lib/adapters/orders";
import { formatDate, formatPrice, conditionMeta } from "@/lib/format";
import { getProductBySlug } from "@/lib/catalog";
import type { Order } from "@/lib/types";
import { ProductImage } from "@/components/product/ProductImage";

export const paymentLabel = (m: Order["paymentMethod"]) => (m === "cod" ? "Cash on Delivery" : m === "bank-transfer" ? "Mobile Wallet Transfer" : "Pay via WhatsApp");
export const paymentStatusLabel = (s: Order["paymentStatus"]) => (s === "paid" ? "Paid" : s === "awaiting-verification" ? "Awaiting verification" : "Pay on delivery / pending");

export function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h3 className="mb-4 !font-sans text-xs font-bold uppercase !tracking-[0.14em] text-muted">Items</h3>
        <ul className="divide-y divide-line border-y border-line">
          {order.items.map((i) => {
            const p = getProductBySlug(i.slug);
            return (
              <li key={i.productId} className="flex items-center gap-4 py-4">
                <div className="aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-line/60" style={{ background: "var(--art-bg-b)" }}>
                  {p ? <ProductImage product={p} /> : <div className="size-full" />}
                </div>
                <div className="min-w-0 flex-1">
                  {p ? <Link href={`/product/${i.slug}`} className="link-underline block truncate text-sm font-semibold">{i.brand} {i.name}</Link> : <p className="truncate text-sm font-semibold">{i.brand} {i.name}</p>}
                  <p className="text-xs text-muted">{i.size} · {i.color} · {conditionMeta(i.condition).short}{i.qty > 1 ? ` · Qty ${i.qty}` : ""}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatPrice(i.price * i.qty)}</p>
              </li>
            );
          })}
        </ul>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Discount{order.promoCode ? ` (${order.promoCode})` : ""}</dt><dd className="tabular-nums text-success">− {formatPrice(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="tabular-nums">{order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(order.total)}</dd></div>
        </dl>
      </div>

      <div className="space-y-6 text-sm">
        <section>
          <h3 className="mb-2 !font-sans text-xs font-bold uppercase !tracking-[0.14em] text-muted">Order</h3>
          <p className="font-semibold">{order.id}</p>
          <p className="text-muted">Placed {formatDate(order.placedAt, true)}</p>
        </section>
        <section>
          <h3 className="mb-2 !font-sans text-xs font-bold uppercase !tracking-[0.14em] text-muted">Delivering to</h3>
          <address className="not-italic leading-relaxed text-muted">
            <span className="font-semibold text-fg">{order.shipping.fullName}</span><br />
            {order.shipping.address}<br />{order.shipping.city}, {order.shipping.province} {order.shipping.postalCode}<br />{order.shipping.phone}
          </address>
          <p className="mt-2 text-muted">{deliveryLabel(order.deliveryMethod)}</p>
        </section>
        <section>
          <h3 className="mb-2 !font-sans text-xs font-bold uppercase !tracking-[0.14em] text-muted">Payment</h3>
          <p className="font-semibold">{paymentLabel(order.paymentMethod)}</p>
          <p className="text-muted">{paymentStatusLabel(order.paymentStatus)}</p>
        </section>
      </div>
    </div>
  );
}
