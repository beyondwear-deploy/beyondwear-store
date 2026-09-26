import { BrandMarquee, DepartmentSplit, FeaturedCategories, InstagramSection, NewArrivalsSection, NewsletterSection, ProcessStrip, SustainabilitySection, TestimonialsSection, TrendingSection, WhyPreloved } from "@/components/home/Sections";
import { EmptyCatalogHero, Hero } from "@/components/home/Hero";
import { forDepartment, getAllProducts, newest, popular } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export default function HomePage() {
  const all = getAllProducts();
  const inStock = (l: Product[]) => l.filter((p) => p.stock > 0);

  // Nothing listed yet (fresh install, before the first product is added from
  // /admin/products/new) — show a simple, product-free hero instead of
  // crashing on missing showcase images.
  if (all.length === 0) {
    return (
      <>
        <EmptyCatalogHero />
        <WhyPreloved />
        <ProcessStrip />
        <SustainabilitySection listedCount={0} />
        <TestimonialsSection />
        <NewsletterSection />
      </>
    );
  }

  const brands = Array.from(new Set(all.map((p) => p.brand))).sort();

  // Showcase pairs come from whatever's actually in the live catalogue (most
  // popular in-stock first), cycling through what's available so even a
  // small catalogue fills every slot without repeating a hardcoded demo name.
  const showcase = popular(inStock(all)).length ? popular(inStock(all)) : popular(all);
  const pick = (i: number) => showcase[i % showcase.length];
  const pickForDept = (d: "men" | "women" | "kids") => {
    const list = popular(inStock(forDepartment(d, all)));
    return list[0] ?? showcase[0];
  };
  const dept = (d: "men" | "women" | "kids") => popular(inStock(forDepartment(d, all))).slice(0, 4);

  const picks = { men: pickForDept("men"), women: pickForDept("women"), kids: pickForDept("kids") };

  const igTiles = Array.from({ length: Math.min(6, showcase.length) }).map((_, i) => ({ product: pick(i), index: i % 3 }));

  return (
    <>
      <Hero main={pick(0)} topRight={pick(1)} midRight={pick(2)} badge={pick(3)} featured={pick(4)} />
      <BrandMarquee brands={brands} />
      <FeaturedCategories picks={picks} />
      <NewArrivalsSection products={newest(inStock(all)).slice(0, 10)} />
      <TrendingSection products={popular(inStock(all)).slice(0, 8)} />
      {dept("men").length > 0 && <DepartmentSplit eyebrow="The men's edit" title="Men" blurb="Sneakers, boots and everyday pairs." href="/men" hero={pickForDept("men")} products={dept("men")} tint="var(--bg-soft)" />}
      {dept("women").length > 0 && <DepartmentSplit eyebrow="The women's edit" title="Women" blurb="Clean, wearable pairs with a second act." href="/women" hero={pickForDept("women")} products={dept("women")} tint="var(--art-tint-accent)" reverse />}
      {dept("kids").length > 0 && <DepartmentSplit eyebrow="The kids' edit" title="Kids" blurb="Quality that's barely been outgrown." href="/kids" hero={pickForDept("kids")} products={dept("kids")} tint="var(--bg-soft)" />}
      <WhyPreloved />
      <ProcessStrip />
      <SustainabilitySection listedCount={all.length} />
      <TestimonialsSection />
      <InstagramSection tiles={igTiles} />
      <NewsletterSection />
    </>
  );
}
