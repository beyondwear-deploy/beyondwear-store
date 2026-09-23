import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/ProductView";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAllProducts, getProductBySlug, relatedProducts } from "@/lib/catalog";
import { siteConfig } from "@/lib/config";
import { conditionMeta } from "@/lib/format";

export const dynamicParams = false;
export function generateStaticParams() { return getAllProducts().map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) return { title: "Product not found" };
  const cond = conditionMeta(p.condition).label;
  const title = `${p.brand} ${p.name} — ${p.color}, Size ${p.size} (${cond})`;
  const description = `${p.brand} ${p.name} in ${p.color}, size ${p.size}. ${cond} preloved condition. Rs ${p.price.toLocaleString()}. ${p.conditionNotes[0] ?? ""}`.trim();
  const img = p.images.find((i) => i.src)?.src ?? siteConfig.seo.ogImage;
  return {
    title, description, alternates: { canonical: `/product/${p.slug}` },
    openGraph: { type: "website", title, description, url: `/product/${p.slug}`, images: [{ url: img, alt: p.images[0].alt }] },
    twitter: { card: "summary_large_image", title, description, images: [img] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) notFound();
  const related = relatedProducts(p, 4);
  const domain = siteConfig.brand.domain;
  const images = p.images.filter((i) => i.src).map((i) => i.src!);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.brand} ${p.name}`,
    sku: p.sku,
    mpn: p.id,
    description: p.description,
    brand: { "@type": "Brand", name: p.brand },
    color: p.color,
    size: p.size,
    material: p.material,
    category: p.type,
    image: images.length ? images : [`${domain}${siteConfig.seo.ogImage}`],
    itemCondition: p.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url: `${domain}/product/${p.slug}`,
      priceCurrency: siteConfig.currency.code,
      price: p.price,
      itemCondition: p.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      seller: { "@type": "Organization", name: siteConfig.brand.name },
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ProductView product={p} />
      <section className="container-x py-16 sm:py-24">
        <SectionHeading eyebrow="You may also like" title="Similar pairs" href={`/shop?category=${p.category}`} />
        <ProductGrid products={related} />
      </section>
      <RecentlyViewed excludeId={p.id} />
    </>
  );
}
