import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopClient } from "@/components/shop/ShopClient";
import { ProductGridSkeleton } from "@/components/ui/LoadingState";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true }, alternates: { canonical: "/search" } };

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-x py-16"><ProductGridSkeleton count={8} /></div>}>
      <ShopClient isSearch title="Search" eyebrow="Search" blurb="Search by product, brand, category or keyword." crumbs={[{ label: "Search" }]} showCategoryNav={false} />
    </Suspense>
  );
}
