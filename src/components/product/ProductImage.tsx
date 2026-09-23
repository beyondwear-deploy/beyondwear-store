import { ProductArt } from "@/components/art/ProductArt";
import type { Product } from "@/lib/types";

/** Renders a real photo when `src` is set, otherwise the generated studio art. */
export function ProductImage({ product, index = 0, className = "h-full w-full", eager = false, tint }: { product: Product; index?: number; className?: string; eager?: boolean; tint?: string }) {
  const img = product.images[index] ?? product.images[0];
  if (img.src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img.src} alt={img.alt} loading={eager ? "eager" : "lazy"} decoding="async" className={`${className} object-cover`} />;
  return (
    <ProductArt
      art={product.art}
      view={img.view}
      alt={img.alt}
      className={className}
      tint={tint}
      meta={{ brand: product.brand, size: product.size, material: product.material, wearNote: product.wearNote }}
    />
  );
}
