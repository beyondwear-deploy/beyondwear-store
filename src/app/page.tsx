import { BrandMarquee, DepartmentSplit, FeaturedCategories, InstagramSection, NewArrivalsSection, NewsletterSection, ProcessStrip, SustainabilitySection, TestimonialsSection, TrendingSection, WhyPreloved } from "@/components/home/Sections";
import { Hero } from "@/components/home/Hero";
import { forDepartment, getAllProducts, newest, popular } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export default function HomePage() {
  const all = getAllProducts();
  // Pick showcase pairs by name; fall back to the most popular in-stock pair if a name changes.
  const fallback = popular(all.filter((p) => p.stock > 0));
  const find = (s: string) => all.find((p) => `${p.brand} ${p.name}`.includes(s)) ?? fallback[0] ?? all[0];
  const inStock = (l: Product[]) => l.filter((p) => p.stock > 0);
  const brands = Array.from(new Set(all.map((p) => p.brand))).sort();

  const picks = { men: find("Jordan Air Jordan 1"), women: find("Adidas Suede"), kids: find("Puma Kids Runner") };
  const dept = (d: "men" | "women" | "kids") => popular(inStock(forDepartment(d, all))).slice(0, 4);

  const igTiles = [
    { product: find("Nike Air Max"), index: 0 }, { product: find("Adidas Samba"), index: 1 }, { product: find("Nike Dunk"), index: 2 },
    { product: find("Dr. Martens"), index: 0 }, { product: find("Adidas Suede"), index: 4 }, { product: find("New Balance 550"), index: 3 },
  ];

  return (
    <>
      <Hero main={find("Adidas Samba")} topRight={find("Nike Air Max")} midRight={find("Adidas Suede")} badge={find("Dr. Martens")} featured={find("Jordan Air Jordan 1")} />
      <BrandMarquee brands={brands} />
      <FeaturedCategories picks={picks} />
      <NewArrivalsSection products={newest(inStock(all)).slice(0, 10)} />
      <TrendingSection products={popular(inStock(all)).slice(0, 8)} />
      <DepartmentSplit eyebrow="The men's edit" title="Men" blurb="Sneakers, boots and everyday pairs." href="/men" hero={find("Nike Dunk")} products={dept("men")} tint="var(--bg-soft)" />
      <DepartmentSplit eyebrow="The women's edit" title="Women" blurb="Clean, wearable pairs with a second act." href="/women" hero={find("Timberland Premium")} products={dept("women")} tint="var(--art-tint-accent)" reverse />
      <DepartmentSplit eyebrow="The kids' edit" title="Kids" blurb="Quality that's barely been outgrown." href="/kids" hero={find("Puma Kids Runner")} products={dept("kids")} tint="var(--bg-soft)" />
      <WhyPreloved />
      <ProcessStrip />
      <SustainabilitySection listedCount={all.length} />
      <TestimonialsSection />
      <InstagramSection tiles={igTiles} />
      <NewsletterSection />
    </>
  );
}
