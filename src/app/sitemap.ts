import type { MetadataRoute } from "next";
import { POLICIES } from "@/data/policies";
import { getAllProducts } from "@/lib/catalog";
import { siteConfig } from "@/lib/config";

/** Generated from the catalogue — new products appear automatically. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.brand.domain.replace(/\/$/, "");
  const now = new Date();
  const top = ["", "/shop", "/new-arrivals", "/men", "/women", "/kids", "/about", "/our-work", "/services", "/sustainability", "/contact", "/faq", "/size-guide", "/track-order", "/policies"];
  return [
    ...top.map((p) => ({ url: base + p, lastModified: now, changeFrequency: (p === "" || p === "/shop" || p === "/new-arrivals" ? "daily" : "monthly") as "daily" | "monthly", priority: p === "" ? 1 : p === "/shop" ? 0.9 : 0.6 })),
    ...POLICIES.map((p) => ({ url: `${base}/policies/${p.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 })),
    ...getAllProducts().map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: new Date(p.addedAt), changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
