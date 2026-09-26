import type { MetadataRoute } from "next";
import { POLICIES } from "@/data/policies";
import { getSellableProductsFresh } from "@/lib/catalog";
import { siteConfig } from "@/lib/config";

/**
 * Generated from the catalogue — new products appear automatically.
 *
 * IMPORTANT: this route runs as its own handler and never renders
 * src/app/layout.tsx, so it must fetch products with getSellableProductsFresh()
 * (a direct DB read) rather than getAllProducts() (which only sees products
 * once the root layout has populated the in-memory cache for a page render).
 * Using getAllProducts() here silently produced a sitemap with zero product
 * URLs in it — every real listing was invisible to it.
 */
// Without this, Next.js prerenders sitemap.xml once at build time and serves
// that same static file forever — so a product added from the admin panel
// (no rebuild involved) would never appear in it. Revalidating hourly keeps
// it fresh for crawlers without hitting the database on every single hit.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.brand.domain.replace(/\/$/, "");
  const now = new Date();
  const top = ["", "/shop", "/new-arrivals", "/men", "/women", "/kids", "/about", "/our-work", "/services", "/sustainability", "/contact", "/faq", "/size-guide", "/track-order", "/policies"];
  const products = await getSellableProductsFresh();
  return [
    ...top.map((p) => ({ url: base + p, lastModified: now, changeFrequency: (p === "" || p === "/shop" || p === "/new-arrivals" ? "daily" : "monthly") as "daily" | "monthly", priority: p === "" ? 1 : p === "/shop" ? 0.9 : 0.6 })),
    ...POLICIES.map((p) => ({ url: `${base}/policies/${p.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 })),
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: new Date(p.addedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images.filter((i) => i.src).map((i) => i.src!),
    })),
  ];
}
