/**
 * In-memory holder for admin-added ("Add new product") listings, read
 * synchronously by src/lib/catalog.ts. Same pattern and same known
 * tradeoffs as productOverrideCache.ts — see that file's comment.
 */
import type { Product } from "./types";

let cache: Product[] = [];

export function setCustomProductsCache(products: Product[]): void {
  cache = products ?? [];
}

export function getCustomProductsCache(): Product[] {
  return cache;
}
