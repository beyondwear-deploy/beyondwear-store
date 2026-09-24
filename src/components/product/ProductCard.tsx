"use client";
import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";
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
      className={cn("group relative overflow-hidden rounded-2xl bg-elev ring-1 ring-line/60 transition-shadow duration-500 hover:shadow-card", className)}
      onMouseEnter={() => setHovered(true)}
      onFocus={() => setHovered(true)}
    >
      <div className="relative aspect-square overflow-hidden bg-soft">
        <Link href={`/product/${p.slug}`} aria-label={label} className="absolute inset-0 z-0 block">
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
          {!sold && disc ? <Badge tone="accent">−{disc}%</Badge> : !sold && isJustIn(p) ? <Badge tone="accent">Just in</Badge> : null}
        </div>
        <div className="pointer-events-none absolute right-3 top-3 z-10">
          <ConditionBadge condition={p.condition} className="shadow-soft" />
        </div>

        {sold && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <span className="rounded-full bg-fg px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-bg shadow-lift">Sold out</span>
          </div>
        )}

        {/* hover actions (pointer devices) */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex translate-y-3 gap-2 opacity-0 transition-all duration-500 ease-[var(--ease)] group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 touch:hidden">
          <button type="button" onClick={() => setQuickView(p.id)} className="glass flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition hover:bg-elev">
            <Eye className="size-4" aria-hidden /> Quick view
          </button>
          <WishlistButton productId={p.id} name={`${p.brand} ${p.name}`} size="sm" className="h-10 flex-none" />
        </div>
      </div>

      <div className="space-y-1.5 p-4">
        <Link href={`/product/${p.slug}`} tabIndex={-1} aria-hidden className="block space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">{p.brand}</p>
          <h3 className="truncate text-lg font-semibold uppercase leading-tight tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{p.name}</h3>
        </Link>
        <span className="inline-flex items-center rounded-md bg-soft px-2 py-0.5 text-[11px] font-semibold text-muted ring-1 ring-line">{p.size}</span>
        <div className="flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="text-lg font-bold">{formatPrice(p.price)}</span>
          {p.originalPrice && <span className="text-xs text-subtle line-through">{formatPrice(p.originalPrice)}</span>}
        </div>
        {!sold && avail === 1 && <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Only 1 available</p>}

        {sold ? (
          <Link href={`/shop?category=${p.category}`} className="mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-soft text-[12px] font-bold uppercase tracking-[0.1em] text-muted ring-1 ring-line">Find similar</Link>
        ) : (
          <button
            type="button"
            onClick={() => addToCart(p)}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent text-[12px] font-bold uppercase tracking-[0.1em] text-accent-fg transition hover:brightness-110 active:scale-[0.98]"
          >
            <ShoppingBag className="size-4" aria-hidden /> Add to cart
          </button>
        )}
      </div>
    </article>
  );
}
