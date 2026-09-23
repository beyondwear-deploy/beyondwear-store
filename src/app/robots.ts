import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.brand.domain.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/cart", "/checkout", "/account", "/order-confirmation", "/wishlist", "/search"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
