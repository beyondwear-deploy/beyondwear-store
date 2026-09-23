"use client";
import { useMemo } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProductById } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { useReady, useRecent } from "@/store";
import { ProductRail } from "./ProductGrid";

export function RecentlyViewed({ excludeId, title = "Recently viewed" }: { excludeId?: string; title?: string }) {
  const ready = useReady();
  const viewed = useRecent((s) => s.viewed);
  const items = useMemo(() => viewed.filter((id) => id !== excludeId).map(getProductById).filter(Boolean).slice(0, 8) as Product[], [viewed, excludeId]);
  if (!ready || items.length === 0) return null;
  return (
    <section className="container-x pb-16 sm:pb-24">
      <SectionHeading eyebrow="Pick up where you left off" title={title} />
      <ProductRail products={items} label="Recently viewed products" />
    </section>
  );
}
