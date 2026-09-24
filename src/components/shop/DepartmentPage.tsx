import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/product/CategoryCard";
import { ProductGrid, ProductRail } from "@/components/product/ProductGrid";
import { ProductImage } from "@/components/product/ProductImage";
import { ComingSoonStrip } from "@/components/shop/ComingSoon";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DEPARTMENTS, forDepartment, getAllProducts, newest, popular } from "@/lib/catalog";

type Dept = "men" | "women" | "kids";

export function DepartmentPage({ dept }: { dept: Dept }) {
  const d = DEPARTMENTS[dept];
  const all = forDepartment(dept, getAllProducts());
  const inStock = all.filter((p) => p.stock > 0);
  const hero = popular(inStock).slice(0, 3);
  const featured = popular(inStock).slice(0, 4);
  const arrivals = newest(inStock).slice(0, 8);
  const best = popular(inStock).slice(4, 8);
  const gq = dept === "kids" ? "kids" : dept;
  const types = Array.from(new Set(all.map((p) => p.type)))
    .map((type) => { const list = all.filter((p) => p.type === type); return { type, count: list.length, rep: popular(list)[0] }; })
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <>
      {/* hero banner */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-[30rem] rounded-full bg-accent/15 blur-[100px]" />
        <div className="container-x grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Breadcrumbs items={[{ label: d.label }]} />
            <p className="eyebrow mb-4 mt-10 flex items-center gap-3"><span className="h-px w-8 bg-accent" aria-hidden />{d.label}</p>
            <h1 className="text-balance text-5xl leading-[0.98] sm:text-7xl">{d.headline}</h1>
            <p className="mt-6 max-w-md text-lg text-muted">{d.blurb}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={`/shop?gender=${gq}`} size="lg" arrow>Shop all {d.label.toLowerCase()}</Button>
              <Button href={`/new-arrivals?gender=${gq}`} size="lg" variant="outline">New arrivals</Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4" aria-hidden>
            {hero.map((p, i) => (
              <div key={p.id} className={`aspect-[4/5] overflow-hidden rounded-[1.6rem] shadow-card ring-1 ring-line/60 ${i === 1 ? "translate-y-8" : ""}`}>
                <ProductImage product={p} tint={i === 1 ? "var(--art-tint-accent)" : "var(--art-tint-neutral)"} eager />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* shop by type */}
      {types.length > 1 && (
        <section className="container-x py-16 sm:py-24">
          <SectionHeading eyebrow="Shop by type" title={`${d.label}'s shoes by style`} />
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {types.map((t, i) => (
              <Reveal as="li" key={t.type} delay={(i % 4) * 0.06}>
                <CategoryCard title={t.type} blurb={`${t.count} ${t.count === 1 ? "pair" : "pairs"}`} href={`/shop?gender=${gq}&type=${encodeURIComponent(t.type)}`} product={t.rep} />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <section className="container-x pb-16 sm:pb-24">
        <SectionHeading eyebrow="Featured" title={`Featured for ${d.label.toLowerCase()}`} href={`/shop?gender=${gq}&sort=popular`} />
        <ProductGrid products={featured} />
      </section>

      <section className="container-x pb-16 sm:pb-24">
        <SectionHeading eyebrow="Just in" title="New arrivals" href={`/new-arrivals?gender=${gq}`} hrefLabel="See all new" />
        <ProductRail products={arrivals} label={`${d.label} new arrivals`} />
      </section>

      {best.length > 0 && (
      <section className="container-x pb-16 sm:pb-24">
        <SectionHeading eyebrow="Best sellers" title="Most loved" blurb="What other shoppers are saving to their wishlists." href={`/shop?gender=${gq}&sort=popular`} />
        <ProductGrid products={best} />
      </section>
      )}

      <ComingSoonStrip className="pb-16 sm:pb-24" />

      <section className="container-x pb-8">
        <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-inverse px-6 py-14 text-center text-inverse-fg sm:px-14 sm:py-20">
          <div aria-hidden className="absolute -left-16 -top-16 -z-10 size-80 rounded-full bg-accent/25 blur-3xl" />
          <p className="eyebrow mb-4 !text-inverse-fg/60">One-of-one</p>
          <h2 className="mx-auto max-w-2xl text-balance text-4xl sm:text-6xl">Found your pair? Don't wait — there's only one.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={`/shop?gender=${gq}`} variant="accent" size="lg" arrow>Browse everything</Button>
            <Link href="/faq" className="inline-flex h-14 items-center gap-2 px-4 text-xs font-bold uppercase tracking-[0.1em] hover:text-accent">How condition works <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
