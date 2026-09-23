"use client";
import { BadgeCheck, Camera, MessageCircle, PackageCheck, Ruler, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { isJustIn, categoryLabel } from "@/lib/catalog";
import { siteConfig } from "@/lib/config";
import { discountPercent, formatPrice } from "@/lib/format";
import { useAddToCart } from "@/lib/hooks/useAddToCart";
import type { Product } from "@/lib/types";
import { useAvailable, useCart, useRecent, useUI } from "@/store";
import { ConditionMeter } from "./ConditionMeter";
import { ProductGallery } from "./ProductGallery";
import { ShareButton } from "./ShareButton";
import { WishlistButton } from "./WishlistButton";

export function ProductView({ product: p }: { product: Product }) {
  const router = useRouter();
  const avail = useAvailable(p);
  const sold = avail <= 0;
  const inCart = useCart((s) => s.lines.some((l) => l.productId === p.id));
  const addToCart = useAddToCart();
  const viewRecent = useRecent((s) => s.view);
  const setSizeGuide = useUI((s) => s.setSizeGuideOpen);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [showBar, setShowBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const disc = discountPercent(p.price, p.originalPrice);
  const wearIdx = p.images.findIndex((i) => i.view === "wear");

  useEffect(() => { viewRecent(p.id); }, [p.id, viewRecent]);
  useEffect(() => {
    const el = ctaRef.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el); return () => io.disconnect();
  }, []);

  const buyNow = () => { const r = addToCart(p, { silent: true }); if (r !== "sold-out") router.push("/checkout"); };
  const wa = `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(`Hi! I have a question about ${p.brand} ${p.name} (${p.sku}, size ${p.size}).`)}`;

  return (
    <div className="container-x pb-10 pt-6 sm:pt-8">
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: categoryLabel(p.category), href: `/shop?category=${p.category}` }, { label: `${p.brand} ${p.name}` }]} />

      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[1.12fr_1fr] lg:gap-14 xl:gap-20">
        <ProductGallery product={p} sold={sold} openAt={openAt} onOpenAtHandled={() => setOpenAt(null)} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/shop?brand=${encodeURIComponent(p.brand)}`} className="eyebrow link-underline hover:text-fg">{p.brand}</Link>
            {!sold && isJustIn(p) && <Badge tone="accent">Just in</Badge>}
            {sold && <Badge tone="dark">Sold out</Badge>}
          </div>
          <h1 className="mt-3 text-4xl leading-[1.05] sm:text-5xl">{p.name}</h1>
          <p className="mt-2 text-xs text-muted">SKU {p.sku} · {p.type}</p>

          <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-bold tabular-nums">{formatPrice(p.price)}</span>
            {p.originalPrice && <span className="text-base text-subtle line-through">{formatPrice(p.originalPrice)}</span>}
            {disc && <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">Save {disc}%</span>}
          </p>
          {p.originalPrice && <p className="mt-1 text-xs text-subtle">Reference price is the typical new retail price, shown for context.</p>}

          <div className="mt-7 rounded-3xl border border-line bg-elev p-5"><ConditionMeter condition={p.condition} /></div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="eyebrow !text-[10px]">Size</dt><dd className="mt-1.5 flex items-center gap-3"><span className="rounded-lg border border-fg px-3.5 py-1.5 font-semibold">{p.size}</span><button type="button" onClick={() => setSizeGuide(true)} className="link-underline inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-fg"><Ruler className="size-3.5" aria-hidden />Size guide</button></dd></div>
            <div><dt className="eyebrow !text-[10px]">Colour</dt><dd className="mt-1.5 flex items-center gap-2 py-1.5 font-medium"><span aria-hidden className="size-5 rounded-full ring-1 ring-line-strong" style={{ background: p.colorHex }} />{p.color}</dd></div>
          </dl>

          <p className="mt-6 text-sm font-semibold" role="status">
            {sold ? <span className="text-danger">Sold out — this one-of-one pair has found a new home.</span>
              : <span className="inline-flex items-center gap-2 text-success"><span aria-hidden className="size-2 animate-pulse rounded-full bg-success" />{avail === 1 ? "Only 1 available — one-of-one pair" : `${avail} available`}</span>}
          </p>

          <div ref={ctaRef} className="mt-5 space-y-3">
            {sold ? (
              <>
                <div role="alert" className="rounded-2xl bg-soft px-5 py-4 text-sm">This pair can't be purchased any more. Save it to your wishlist for reference, or find something similar below.</div>
                <div className="flex gap-3"><Button href={`/shop?category=${p.category}&availability=in-stock`} size="lg" full arrow>Find similar pairs</Button><WishlistButton productId={p.id} name={`${p.brand} ${p.name}`} withLabel /></div>
              </>
            ) : (
              <>
                <Button onClick={() => addToCart(p)} size="lg" full icon={<ShoppingBag className="size-4" />} disabled={inCart}>{inCart ? "In your bag" : "Add to bag"}</Button>
                <Button onClick={buyNow} size="lg" full variant="accent" icon={<Zap className="size-4" />}>Buy now</Button>
                <div className="flex gap-3"><WishlistButton productId={p.id} name={`${p.brand} ${p.name}`} withLabel className="flex-1" /><ShareButton title={`${p.brand} ${p.name}`} path={`/product/${p.slug}`} /></div>
              </>
            )}
          </div>

          <ul className="mt-7 grid gap-3 border-y border-line py-5 text-sm sm:grid-cols-3">
            {[[ShieldCheck, "Inspected & graded"], [Truck, "Cash on Delivery"], [PackageCheck, "Carefully packed"]].map(([I, t]) => { const Icon = I as typeof ShieldCheck; return <li key={t as string} className="flex items-center gap-2.5 text-muted"><Icon className="size-5 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />{t as string}</li>; })}
          </ul>

          <a href={wa} target="_blank" rel="noopener noreferrer" className="group mt-5 flex items-center justify-between gap-4 rounded-2xl bg-soft px-5 py-4 transition hover:bg-line">
            <span className="flex items-center gap-3"><MessageCircle className="size-5 text-accent" aria-hidden /><span><span className="block text-sm font-semibold">Have a question about this product?</span><span className="text-xs text-muted">Ask us on WhatsApp — we reply fast<span className="sr-only"> (opens in a new tab)</span></span></span></span>
            <span aria-hidden className="text-lg transition-transform group-hover:translate-x-1">→</span>
          </a>
          <p className="mt-2 text-center text-xs text-muted">Prefer email? <Link href={`/contact?product=${p.slug}`} className="font-semibold underline underline-offset-4 hover:text-fg">Send us a message</Link></p>

          <div className="mt-8">
            <Accordion allowMultiple defaultOpen={[0, 1]} items={[
              { q: "Condition details", a: (
                <div className="space-y-4">
                  <p className="text-sm">We disclose every sign of wear. Here's exactly what to expect:</p>
                  <ul className="space-y-2">{p.conditionNotes.map((n) => <li key={n} className="flex gap-2.5"><BadgeCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />{n}</li>)}</ul>
                  {wearIdx >= 0 && <button type="button" onClick={() => setOpenAt(wearIdx)} className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-fg transition hover:bg-fg hover:text-bg"><Camera className="size-4" aria-hidden />View wear photos</button>}
                </div>) },
              { q: "Measurements", a: (
                <div className="space-y-3">
                  <table className="w-full max-w-md text-sm"><caption className="sr-only">Shoe measurements in inches</caption><tbody className="divide-y divide-line">{p.measurements.map((m) => <tr key={m.label}><th scope="row" className="py-2.5 pr-4 text-left font-medium text-fg">{m.label}</th><td className="py-2.5 text-right tabular-nums">{m.value}</td></tr>)}</tbody></table>
                  <p className="text-xs">Measured by us, in inches. Compare with a pair you already own.</p>
                  <button type="button" onClick={() => setSizeGuide(true)} className="link-underline inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-fg"><Ruler className="size-4" aria-hidden />Open size guide</button>
                </div>) },
              { q: "Description", a: <p>{p.description}</p> },
              { q: "Material & care", a: <p>{p.material}. Cleaned and deodorised before listing — wipe with a soft damp cloth and air-dry away from direct heat to keep them in great shape.</p> },
              { q: "Authenticity", a: (
                <div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden /><p>{p.authenticity.note}{siteConfig.demoMode && <span className="mt-2 block text-xs text-subtle">Demo listing — authenticity wording is a template to confirm against your real process.</span>}</p></div>) },
              { q: "Delivery & returns", a: <p>Standard delivery 3–5 working days (free over Rs 5,000), Express 1–2 days to major cities, Cash on Delivery available. Not as described? Tell us within 48 hours. See our <Link href="/policies/shipping" className="underline">Shipping</Link> and <Link href="/policies/returns" className="underline">Return & Exchange</Link> policies.</p> },
            ]} />
          </div>
        </div>
      </div>

      {/* sticky mobile buy bar */}
      {!sold && (
        <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-line glass p-3 transition-transform duration-500 ease-[var(--ease)] lg:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`} aria-hidden={!showBar}>
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{p.brand} {p.name}</p><p className="text-sm font-bold">{formatPrice(p.price)}</p></div>
            <Button onClick={() => addToCart(p)} disabled={inCart} tabIndex={showBar ? 0 : -1}>{inCart ? "In bag" : "Add to bag"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
