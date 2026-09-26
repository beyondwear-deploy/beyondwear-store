import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllProducts } from "@/lib/catalog";
import { cn } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";

export function CategoryCard({ title, blurb, href, product, className, count }: { title: string; blurb: string; href: string; product?: Product; className?: string; count?: number }) {
  const p = product ?? getAllProducts()[0];
  return (
    <Link href={href} className={cn("group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-soft ring-1 ring-line/60", className)}>
      <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease)] group-hover:scale-110">
        {p ? <ProductImage product={p} index={0} /> : <div className="size-full bg-gradient-to-br from-soft to-line" aria-hidden />}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/80" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white transition-transform duration-500 ease-[var(--ease)] group-hover:-translate-y-1">
        <div>
          <h3 className="text-3xl !text-white sm:text-4xl">{title}</h3>
          <p className="mt-1 text-xs text-white/80">{blurb}{count !== undefined && <span className="ml-1 text-white/60">· {count}</span>}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/95 text-black transition-all duration-500 group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-fg" aria-hidden>
          <ArrowUpRight className="size-5 transition-transform duration-500 group-hover:rotate-45" />
        </span>
      </div>
      <span className="sr-only">Explore {title}</span>
    </Link>
  );
}
