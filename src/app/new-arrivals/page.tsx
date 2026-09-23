import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopClient } from "@/components/shop/ShopClient";
import { ProductGridSkeleton } from "@/components/ui/LoadingState";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "Just in: the latest preloved pairs added to the store. One-of-one — once it's gone, it's gone.",
  alternates: { canonical: "/new-arrivals" },
};
const defaults = { sort: "newest" as const, availability: "in-stock" as const };

export default function NewArrivalsPage() {
  return (
    <Suspense fallback={<div className="container-x py-16"><ProductGridSkeleton count={8} /></div>}>
      <ShopClient title="New arrivals" eyebrow="Just in" blurb="Freshly listed, newest first. Every pair is one-of-one." defaults={defaults} crumbs={[{ label: "New Arrivals" }]} />
    </Suspense>
  );
}
