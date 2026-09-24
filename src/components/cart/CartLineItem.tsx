"use client";
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { ConditionBadge } from "@/components/ui/Badge";
import { ProductImage } from "@/components/product/ProductImage";
import { formatPrice } from "@/lib/format";
import type { ResolvedLine } from "@/lib/hooks/useCartSummary";
import { useCart, useUI } from "@/store";

export function CartLineItem({ line, onNavigate }: { line: ResolvedLine; onNavigate?: () => void }) {
  const { product: p, qty, avail, issue } = line;
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const toast = useUI((s) => s.toast);
  const oneOfOne = p.stock === 1;
  return (
    <li className="flex gap-4">
      <Link href={`/product/${p.slug}`} onClick={onNavigate} style={{ background: "var(--art-bg-b)" }} className={`relative block aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-line/60 ${issue ? "opacity-50" : ""}`} aria-label={`View ${p.brand} ${p.name}`}>
        <ProductImage product={p} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow !text-[10px]">{p.brand}</p>
            <Link href={`/product/${p.slug}`} onClick={onNavigate} className="line-clamp-2 text-[15px] font-medium leading-snug hover:underline">{p.name}</Link>
          </div>
          <button type="button" onClick={() => { remove(p.id); toast({ kind: "info", title: "Removed from your bag" }); }} aria-label={`Remove ${p.brand} ${p.name} from bag`} className="-m-1 rounded-full p-2 text-subtle transition hover:bg-soft hover:text-danger active:scale-90"><Trash2 className="size-4" /></button>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">Size {p.size} · {p.color} <ConditionBadge condition={p.condition} showDot={false} className="!px-2 !py-0.5 !text-[9px]" /></p>
        {issue ? (
          <p role="alert" className="mt-2 rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">
            {issue === "sold-out" ? "Sold out — this pair is no longer available. Please remove it to continue." : `Only ${avail} available now.`}
          </p>
        ) : (
          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            {oneOfOne ? (
              <span className="rounded-full bg-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">One-of-one · Qty 1</span>
            ) : (
              <div className="inline-flex items-center rounded-full border border-line-strong" role="group" aria-label={`Quantity for ${p.name}`}>
                <button type="button" onClick={() => setQty(p.id, qty - 1)} disabled={qty <= 1} aria-label="Decrease quantity" className="grid size-9 place-items-center rounded-full transition hover:bg-soft active:scale-90 disabled:opacity-30"><Minus className="size-3.5" /></button>
                <output aria-live="polite" className="w-7 text-center text-sm font-semibold tabular-nums">{qty}</output>
                <button type="button" onClick={() => setQty(p.id, qty + 1)} disabled={qty >= avail} aria-label="Increase quantity" className="grid size-9 place-items-center rounded-full transition hover:bg-soft active:scale-90 disabled:opacity-30"><Plus className="size-3.5" /></button>
              </div>
            )}
            <p className="text-[15px] font-bold tabular-nums">{formatPrice(p.price * qty)}</p>
          </div>
        )}
      </div>
    </li>
  );
}
