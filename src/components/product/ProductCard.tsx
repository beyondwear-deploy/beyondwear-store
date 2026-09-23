"use client";
import Link from "next/link";
import { Eye, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Badge, ConditionBadge } from "@/components/ui/Badge";
import { isJustIn } from "@/lib/catalog";
import { cn, discountPercent, formatPrice } from "@/lib/format";
import { useAddToCart } from "@/lib/hooks/useAddToCart";
import type { Product } from "@/lib/types";
import { useAvailable, useUI } from "@/store";
import { ProductImage } from "./ProductImage";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product: p, priority = false, className }: { product: Product; priority?: boolean; className?: string }) {
  const avail = useAvailable(p);
  const sold = avail <= 0;
  const [hovered, setHovered] = useState(false);
  const addToCart = useAddToCart();
  const setQuickView = useUI((s) => s.setQuickView);
  const disc = discountPercent(p.price, p.originalPrice);
  const label = `${p.brand} ${p.name}, size ${p.size}, ${formatPrice(p.price)}${sold ? ", sold out" : ""}`;

  return (
    <article
      className={cn("group relative", className)}
      onMouseEnter={() => setHovered(true)}
      onFocus={() => setHovered(true)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-soft ring-1 ring-line/60 transition-shadow duration-500 group-hover:shadow-card">
        <Link href={`/product/${p.slug}`} aria-label={label} className="absolute inset-0 z-0 block rounded-2xl">
          <div className={cn("absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.06]", sold && "opacity-60 saturate-50")}>
            <ProductImage product={p} index={0} eager={priority} />
          </div>
          {hovered && p.images.length > 1 && (
            <div aria-hidden className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100">
              <div className="h-full w-full transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.06]">
                <ProductImage product={p} index={1} />
              </div>
            </div>
          )}
        </Link>

        {/* badges */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          <ConditionBadge condition={p.condition} className="shadow-soft" />
          {!sold && isJustIn(p) && <Badge tone="accent">Just in</Badge>}
        </div>
        <div className="absolute right-3 top-3 z-10"><WishlistButton productId={p.id} name={`${p.brand} ${p.name}`} size="sm" /></div>

        {sold && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <span className="rounded-full bg-fg px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-bg shadow-lift">Sold out</span>
          </div>
        )}

        {/* hover actions (pointer devices) */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex translate-y-3 gap-2 opacity-0 transition-all duration-500 ease-[var(--ease)] group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 touch:hidden">
          <button type="button" onClick={() => setQuickView(p.id)} className="glass flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition hover:bg-elev">
            <Eye className="size-4" aria-hidden /> Quick view
          </button>
          {sold ? (
            <Link href={`/shop?category=${p.category}`} className="flex h-11 flex-1 items-center justify-center rounded-full bg-fg text-[11px] font-bold uppercase tracking-[0.1em] text-bg">Find similar</Link>
          ) : (
            <button type="button" onClick={() => addToCart(p)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-fg text-[11px] font-bold uppercase tracking-[0.1em] text-bg transition hover:brightness-125 active:scale-95">
              <ShoppingBag className="size-4" aria-hidden /> Add to bag
            </button>
          )}
        </div>
        {/* touch devices: always-visible compact add button */}
        {!sold && (
          <button type="button" aria-label={`Add ${p.brand} ${p.name} to bag`} onClick={() => addToCart(p)} className="glass absolute bottom-3 right-3 z-10 hidden size-11 place-items-center rounded-full shadow-soft active:scale-90 touch:grid">
            <Plus className="size-5" aria-hidden />
          </button>
        )}
      </div>

      <Link href={`/product/${p.slug}`} tabIndex={-1} aria-hidden className="mt-3.5 block space-y-1">
        <p className="eyebrow !text-[10px]">{p.brand}</p>
        <h3 className="!font-sans text-[15px] font-medium leading-snug !tracking-normal">{p.name}</h3>
        <p className="text-xs text-muted">Size {p.size} · <span className="inline-flex items-center gap-1 align-middle"><span aria-hidden className="inline-block size-2.5 rounded-full ring-1 ring-line-strong" style={{ background: p.colorHex }} />{p.color}</span></p>
        <p className="flex flex-wrap items-baseline gap-x-2 pt-0.5">
          <span className="text-[15px] font-bold">{formatPrice(p.price)}</span>
          {p.originalPrice && <span className="text-xs text-subtle line-through">{formatPrice(p.originalPrice)}</span>}
          {disc && <span className="text-[11px] font-bold text-accent">−{disc}%</span>}
        </p>
        {!sold && avail === 1 && <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Only 1 available</p>}
      </Link>
    </article>
  );
}
