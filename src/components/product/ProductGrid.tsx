"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, className, priorityCount = 0 }: { products: Product[]; className?: string; priorityCount?: number }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < priorityCount} />)}
    </div>
  );
}

/** Horizontal scroll-snap rail with prev/next controls. */
export function ProductRail({ products, label }: { products: Product[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current; if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };
  return (
    <div className="relative">
      <div className="mb-4 hidden justify-end gap-2 sm:flex">
        <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${label} left`} className="grid size-11 place-items-center rounded-full border border-line-strong transition hover:bg-fg hover:text-bg active:scale-90"><ChevronLeft className="size-5" /></button>
        <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${label} right`} className="grid size-11 place-items-center rounded-full border border-line-strong transition hover:bg-fg hover:text-bg active:scale-90"><ChevronRight className="size-5" /></button>
      </div>
      <div ref={ref} role="list" aria-label={label} tabIndex={0} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-7 sm:px-7 lg:-mx-12 lg:px-12">
        {products.map((p) => (
          <div key={p.id} role="listitem" className="w-[62vw] shrink-0 snap-start sm:w-[36vw] md:w-[26vw] lg:w-[21vw] xl:w-[300px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
