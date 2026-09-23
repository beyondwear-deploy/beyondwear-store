import { ArrowRight, Footprints, Instagram, Leaf, Quote, Recycle, Star, Tag, Gem } from "lucide-react";
import Link from "next/link";
import { CategoryCard } from "@/components/product/CategoryCard";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid, ProductRail } from "@/components/product/ProductGrid";
import { ProductImage } from "@/components/product/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { ComingSoonStrip } from "@/components/shop/ComingSoon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROCESS } from "@/data/process";
import { TESTIMONIALS } from "@/data/testimonials";
import { getAllProducts } from "@/lib/catalog";
import { siteConfig } from "@/lib/config";
import type { Product } from "@/lib/types";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

export function BrandMarquee({ brands }: { brands: string[] }) {
  const row = (dup: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={dup || undefined}>
      {brands.map((b) => (
        <li key={b + dup} className="flex items-center whitespace-nowrap px-6 font-display text-3xl italic text-muted/80 sm:text-4xl">
          {b}<span aria-hidden className="ml-12 text-accent">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee overflow-hidden border-y border-line py-6" role="region" aria-label="Brands we carry">
      <div className="marquee-track [animation-duration:55s]">{row(false)}{row(true)}</div>
    </div>
  );
}

export function FeaturedCategories({ picks }: { picks: Record<"men" | "women" | "kids", Product> }) {
  const all = getAllProducts();
  const count = (f: (p: Product) => boolean) => all.filter(f).length;
  return (
    <>
      <section id="collections" className="container-x scroll-mt-24 py-20 sm:py-28">
        <SectionHeading eyebrow="Shop shoes" title="Find your next favourite pair." blurb="Sneakers, boots and everyday pairs — browse by department or see every pair we have." href="/shop" hrefLabel="Shop all shoes" />
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {[
            { t: "Men", b: "Sneakers, boots & everyday pairs", h: "/men", p: picks.men, c: count((p) => p.gender === "men" || p.gender === "unisex") },
            { t: "Women", b: "Clean, wearable, honestly graded", h: "/women", p: picks.women, c: count((p) => p.gender === "women" || p.gender === "unisex") },
            { t: "Kids", b: "Quality pairs, gently used", h: "/kids", p: picks.kids, c: count((p) => p.gender === "kids") },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 0.08}><CategoryCard title={c.t} blurb={c.b} href={c.h} product={c.p} count={c.c} /></Reveal>
          ))}
        </div>
      </section>
      <ComingSoonStrip className="pb-4 sm:pb-8" />
    </>
  );
}

export function NewArrivalsSection({ products }: { products: Product[] }) {
  return (
    <section className="container-x py-12 sm:py-16" aria-labelledby="new-h">
      <SectionHeading eyebrow="Just in" title="New arrivals" blurb="Fresh pairs, added this week. One of each — once it's gone, it's gone." href="/new-arrivals" hrefLabel="See all new" />
      <ProductRail products={products} label="New arrivals" />
    </section>
  );
}

export function TrendingSection({ products }: { products: Product[] }) {
  return (
    <section className="container-x py-16 sm:py-24" aria-labelledby="trend-h">
      <SectionHeading eyebrow="Most wanted" title="Trending now" blurb="The pairs everyone's saving to their wishlist." href="/shop?sort=popular" hrefLabel="Shop popular" />
      <ProductGrid products={products} />
    </section>
  );
}

export function DepartmentSplit({ title, eyebrow, blurb, href, hero, products, tint, reverse }: { title: string; eyebrow: string; blurb: string; href: string; hero: Product; products: Product[]; tint: string; reverse?: boolean }) {
  return (
    <section className="container-x py-12 sm:py-16">
      <div className={`grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <Reveal>
          <Link href={href} className="group relative block h-full min-h-[420px] overflow-hidden rounded-[2rem] ring-1 ring-line/60">
            <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease)] group-hover:scale-105"><ProductImage product={hero} tint={tint} /></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
              <p className="eyebrow mb-3 !text-white/70">{eyebrow}</p>
              <h2 className="text-5xl !text-white sm:text-6xl">{title}</h2>
              <p className="mt-3 max-w-xs text-sm text-white/80">{blurb}</p>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition group-hover:gap-3">Shop {title} <ArrowRight className="size-4" aria-hidden /></span>
            </div>
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 self-center sm:gap-x-5">
          {products.map((p, i) => <Reveal key={p.id} delay={i * 0.07}><ProductCard product={p} /></Reveal>)}
        </div>
      </div>
    </section>
  );
}

export function WhyPreloved() {
  const items = [
    { icon: Gem, t: "Quality that lasts", d: "Well-made shoes have already proven they can last. We choose the pairs with plenty of life left." },
    { icon: Tag, t: "Smarter value", d: "Premium brands and better materials at a fraction of their original price." },
    { icon: Footprints, t: "One-of-one style", d: "No mass-produced sameness. Each pair is a unique find you won't see on everyone else." },
    { icon: Recycle, t: "Kinder to the planet", d: "Extending the life of a pair means fewer new shoes made and less going to waste." },
  ];
  return (
    <section className="bg-soft py-20 sm:py-28">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow mb-4 flex items-center gap-3"><span className="h-px w-8 bg-accent" aria-hidden />Why preloved?</p>
            <h2 className="text-balance text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">Preloved doesn't mean <em className="text-accent">compromised.</em></h2>
            <p className="mt-6 max-w-md text-lg text-muted">Quality, style, value, transparency and a second life — every pair inspected, honestly graded and photographed in detail before it reaches you.</p>
            <Button href="/about" variant="outline" className="mt-8" arrow>Our philosophy</Button>
          </Reveal>
          <ul className="grid gap-4 sm:grid-cols-2">
            {items.map((it, i) => (
              <Reveal as="li" key={it.t} delay={i * 0.08} className="group rounded-3xl border border-line bg-elev p-7 transition duration-500 hover:-translate-y-1 hover:shadow-card">
                <it.icon className="mb-6 size-8 text-accent transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" strokeWidth={1.4} aria-hidden />
                <h3 className="text-2xl">{it.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{it.d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ProcessStrip() {
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="process-h">
      <SectionHeading eyebrow="Our process" title="From closet to your door." blurb="Six careful steps between a pair being sourced and it reaching you." href="/our-work" hrefLabel="See how we work" />
      <ol className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {PROCESS.map((s, i) => (
          <Reveal as="li" key={s.n} delay={(i % 3) * 0.08} className="group relative bg-bg p-7 transition-colors duration-500 hover:bg-elev sm:p-9">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-5xl text-line-strong transition-colors duration-500 group-hover:text-accent">{s.n}</span>
              <s.icon className="size-7 text-muted transition-all duration-500 group-hover:-translate-y-1 group-hover:text-fg" strokeWidth={1.4} aria-hidden />
            </div>
            <h3 className="text-2xl">{s.title}</h3>
            <p className="mt-2 text-sm text-muted">{s.short}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function SustainabilitySection({ listedCount }: { listedCount: number }) {
  const stats = siteConfig.sustainabilityStats.map((s) => ({ ...s, value: s.source === "catalog" ? listedCount : s.value }));
  return (
    <section className="relative isolate overflow-hidden bg-secondary text-secondary-fg" aria-labelledby="sust-h">
      <div aria-hidden className="absolute -right-40 -top-40 -z-10 size-[36rem] rounded-full bg-white/10 blur-3xl" />
      <div className="container-x py-24 sm:py-32">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <Reveal>
            <p className="eyebrow mb-5 flex items-center gap-3 !text-secondary-fg/70"><Leaf className="size-4" aria-hidden />Sustainability</p>
            <h2 id="sust-h" className="text-balance text-5xl uppercase leading-[0.98] tracking-[-0.03em] sm:text-7xl lg:text-8xl">Style deserves a <em className="text-accent">second life.</em></h2>
            <p className="mt-7 max-w-lg text-lg text-secondary-fg/80">Buying preloved extends the life of shoes that are still in great shape and keeps them in use for longer. We keep our claims simple and honest — no borrowed statistics.</p>
            <Button href="/sustainability" variant="inverse" className="mt-9" arrow>Our approach</Button>
          </Reveal>
          <ul className="grid grid-cols-3 gap-3 sm:gap-5">
            {stats.map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 0.1} className="rounded-3xl border border-white/15 bg-white/5 p-4 sm:p-6">
                <p className="font-display text-4xl sm:text-6xl"><Counter to={s.value} suffix={s.suffix} /></p>
                <p className="mt-2 text-[11px] leading-snug text-secondary-fg/75 sm:text-xs">{s.label}</p>
              </Reveal>
            ))}
          </ul>
        </div>
        <ul className="mt-16 grid gap-4 border-t border-white/15 pt-10 sm:grid-cols-3">
          {[["Second life", "Great pairs get worn again instead of sitting unused."], ["Less waste", "Fewer shoes discarded, fewer new ones needed."], ["More style", "Distinctive, one-of-one finds at friendlier prices."]].map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.08}><p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">{t}</p><p className="mt-2 text-sm text-secondary-fg/80">{d}</p></Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="rev-h">
      <SectionHeading eyebrow="Reviews" title="What customers say." />
      {siteConfig.demoMode && <div className="-mt-6 mb-8"><Badge tone="danger">Demo content — replace with real customer reviews before launch</Badge></div>}
      <ul className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal as="li" key={i} delay={i * 0.1} className="flex flex-col rounded-3xl border border-line bg-elev p-7 sm:p-8">
            <Quote className="mb-5 size-8 text-accent/60" aria-hidden />
            <div className="mb-4 flex gap-0.5" role="img" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, k) => <Star key={k} className={`size-4 ${k < t.rating ? "fill-accent stroke-accent" : "stroke-line-strong"}`} aria-hidden />)}
            </div>
            <p className="flex-1 text-[15px] leading-relaxed">“{t.text}”</p>
            <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
              <span aria-hidden className="grid size-10 place-items-center rounded-full bg-soft text-sm font-bold">{t.name[0]}</span>
              <div><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-muted">{t.city} · {t.item}</p></div>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export function InstagramSection({ tiles }: { tiles: { product: Product; index: number }[] }) {
  const ig = siteConfig.socials.instagram;
  return (
    <section className="container-x pb-20 sm:pb-28" aria-labelledby="ig-h">
      <SectionHeading eyebrow="Follow along" title={`${ig.handle} on Instagram`} blurb="New pairs, styling ideas and behind-the-scenes." href={ig.url} hrefLabel="Follow us" />
      {siteConfig.demoMode && <p className="-mt-6 mb-6 text-xs text-subtle">Demo grid — connect your Instagram feed (Meta Graph API) or upload post images to replace these tiles.</p>}
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {tiles.map(({ product, index }, i) => (
          <Reveal as="li" key={i} delay={i * 0.05}>
            <a href={ig.url} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden rounded-2xl bg-soft">
              <div className="absolute inset-0 scale-[1.02] transition-transform duration-700 group-hover:scale-110"><ProductImage product={product} index={index} /></div>
              <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"><Instagram className="size-7 text-white" aria-hidden /></span>
              <span className="sr-only">{product.brand} {product.name} — view on Instagram (opens in a new tab)</span>
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section className="container-x pb-4">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-inverse px-6 py-16 text-inverse-fg sm:px-14 sm:py-20">
        <div aria-hidden className="absolute -left-20 -top-20 -z-10 size-96 rounded-full bg-accent/25 blur-3xl" />
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4 !text-inverse-fg/60">The drop list</p>
          <h2 className="text-balance text-4xl sm:text-6xl">{siteConfig.newsletter.title}</h2>
          <p className="mx-auto mt-4 max-w-md text-inverse-fg/70">One-of-one pairs move fast. Members see new arrivals first.</p>
          <div className="mx-auto mt-9 max-w-xl text-left"><NewsletterForm tone="dark" /></div>
        </div>
      </div>
    </section>
  );
}
