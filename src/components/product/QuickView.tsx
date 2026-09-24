"use client";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Badge, ConditionBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getProductById, isJustIn } from "@/lib/catalog";
import { cn, discountPercent, formatPrice } from "@/lib/format";
import { useAddToCart } from "@/lib/hooks/useAddToCart";
import { useAvailable, useUI } from "@/store";
import { ProductImage } from "./ProductImage";
import { WishlistButton } from "./WishlistButton";

export function QuickView() {
  const id = useUI((s) => s.quickViewId);
  const set = useUI((s) => s.setQuickView);
  const p = id ? getProductById(id) : undefined;
  const avail = useAvailable(p);
  const add = useAddToCart();
  const [idx, setIdx] = useState(0);
  const close = () => { set(null); setIdx(0); };
  const disc = p ? discountPercent(p.price, p.originalPrice) : null;
  return (
    <Modal open={!!p} onClose={close} title={p ? `Quick view: ${p.brand} ${p.name}` : "Quick view"} hideTitle wide>
      {p && (
        <div className="grid max-h-[92dvh] overflow-y-auto md:grid-cols-2">
          <div className="p-4 md:p-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl" style={{ background: "var(--art-bg-b)" }}><ProductImage product={p} index={idx} eager /></div>
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Product images">
              {p.images.map((img, i) => (
                <button key={img.view} type="button" onClick={() => setIdx(i)} aria-label={`Show ${img.view} image`} aria-pressed={i === idx} style={{ background: "var(--art-bg-b)" }} className={cn("aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-lg ring-2 transition", i === idx ? "ring-fg" : "ring-transparent opacity-70 hover:opacity-100")}>
                  <ProductImage product={p} index={i} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 p-5 md:p-7">
            <div className="flex items-start justify-between gap-3">
              <div><p className="eyebrow">{p.brand}</p><h2 className="mt-1 text-3xl">{p.name}</h2></div>
              <button type="button" onClick={close} className="tap -mr-2 grid place-items-center rounded-full hover:bg-soft" aria-label="Close quick view"><span aria-hidden className="text-2xl leading-none">×</span></button>
            </div>
            <div className="flex flex-wrap items-center gap-2"><ConditionBadge condition={p.condition} />{isJustIn(p) && <Badge tone="accent">Just in</Badge>}<span className="text-xs text-muted">Size {p.size} · {p.color}</span></div>
            <p className="flex items-baseline gap-3"><span className="text-2xl font-bold">{formatPrice(p.price)}</span>{p.originalPrice && <span className="text-sm text-subtle line-through">{formatPrice(p.originalPrice)}</span>}{disc && <span className="text-sm font-bold text-accent">−{disc}%</span>}</p>
            <p className="text-sm leading-relaxed text-muted">{p.description}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted">{p.conditionNotes.slice(0, 3).map((n) => <li key={n}>{n}</li>)}</ul>
            <div className="mt-auto flex flex-col gap-3 pt-2">
              {avail > 0 ? (
                <div className="flex gap-3">
                  <Button onClick={() => { add(p); close(); }} size="lg" full icon={<ShoppingBag className="size-4" />}>Add to bag</Button>
                  <WishlistButton productId={p.id} name={`${p.brand} ${p.name}`} className="!size-14 shrink-0" />
                </div>
              ) : (
                <div role="status" className="rounded-2xl bg-soft px-5 py-4 text-sm font-semibold">Sold out — this one-of-one pair has found a new home.</div>
              )}
              {avail === 1 && <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-subtle">Only 1 available</p>}
              <Link href={`/product/${p.slug}`} onClick={close} className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] hover:text-accent">View full details & measurements <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></Link>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
