"use client";
import { formatPrice } from "@/lib/format";
import type { useCartSummary } from "@/lib/hooks/useCartSummary";
import { ProductImage } from "@/components/product/ProductImage";

type Summary = ReturnType<typeof useCartSummary>;

export function TotalsRows({ s, deliveryLabel }: { s: Summary; deliveryLabel?: string }) {
  const Row = ({ k, v, strong, accent }: { k: string; v: string; strong?: boolean; accent?: boolean }) => (
    <div className={`flex items-baseline justify-between ${strong ? "border-t border-line pt-4 text-lg" : "text-sm"}`}>
      <dt className={strong ? "font-semibold" : "text-muted"}>{k}</dt>
      <dd className={`tabular-nums ${strong ? "text-2xl font-bold" : "font-medium"} ${accent ? "text-success" : ""}`}>{v}</dd>
    </div>
  );
  return (
    <dl className="space-y-3">
      <Row k="Subtotal" v={formatPrice(s.subtotal)} />
      {s.discount > 0 && <Row k={`Discount${s.promoCode ? ` (${s.promoCode})` : ""}`} v={`− ${formatPrice(s.discount)}`} accent />}
      <Row k={deliveryLabel ?? "Delivery"} v={s.deliveryFee === 0 ? "Free" : formatPrice(s.deliveryFee)} accent={s.deliveryFee === 0} />
      <Row k="Total" v={formatPrice(s.total)} strong />
    </dl>
  );
}

export function MiniLines({ s }: { s: Summary }) {
  return (
    <ul className="space-y-4">
      {s.items.map(({ product: p, qty }) => (
        <li key={p.id} className="flex items-center gap-3">
          <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-lg bg-soft ring-1 ring-line/60"><ProductImage product={p} />{qty > 1 && <span className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-fg text-[10px] font-bold text-bg">{qty}</span>}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.brand} {p.name}</p><p className="text-xs text-muted">Size {p.size} · {p.color}</p></div>
          <p className="text-sm font-semibold tabular-nums">{formatPrice(p.price * qty)}</p>
        </li>
      ))}
    </ul>
  );
}
