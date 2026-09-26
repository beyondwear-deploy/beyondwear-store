import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ShopClient } from "@/components/shop/ShopClient";
import { ProductGridSkeleton } from "@/components/ui/LoadingState";
import { getAllProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop Preloved Shoes",
  description: "Browse every preloved pair — sneakers, boots and everyday shoes. Filter by size, brand, condition and price.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <>
      <Suspense fallback={<div className="container-x py-16"><ProductGridSkeleton count={8} /></div>}>
        <ShopClient heroId="shop" title="Shop all shoes" eyebrow="The full collection" blurb="Every pair inspected, graded and photographed in detail." crumbs={[{ label: "Shop" }]} />
      </Suspense>
      {/* crawlable product links for search engines */}
      <nav aria-label="All shoes" className="sr-only">
        <ul>{getAllProducts().map((p) => <li key={p.id}><Link href={`/product/${p.slug}`}>{p.brand} {p.name} — size {p.size}</Link></li>)}</ul>
      </nav>
    </>
  );
}
