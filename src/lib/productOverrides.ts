/**
 * PRODUCT OVERRIDES — server-side reads/writes for full product editing
 * (price, photos, name, specs/measurements, condition, description, stock,
 * status). Mirrors lib/content.ts's pattern, one row per product id.
 */
import { PRODUCTS } from "@/data/products";
import { fetchCustomProducts, getCustomProduct } from "@/lib/customProducts";
import { getSupabaseAdmin, isDbConfigured } from "@/lib/supabase";
import { applyProductPatch, type ProductPatch } from "@/lib/productPatch";
import type { Product } from "@/lib/types";

/** Fetches every saved product patch once per request. Empty map if the DB isn't connected yet. */
export async function fetchAllProductOverrides(): Promise<Record<string, ProductPatch>> {
  const db = getSupabaseAdmin();
  if (!db) return {};
  const { data, error } = await db.from("product_overrides").select("product_id, patch");
  if (error || !data) return {};
  const map: Record<string, ProductPatch> = {};
  for (const row of data as { product_id: string; patch: ProductPatch }[]) map[row.product_id] = row.patch ?? {};
  return map;
}

/** Every product (including draft/archived/not-yet-live categories, plus admin-added listings) with saved edits applied — for the admin products list. */
export async function getAdminProductList(): Promise<{ configured: boolean; products: Product[] }> {
  const [overrides, custom] = await Promise.all([fetchAllProductOverrides(), fetchCustomProducts()]);
  const builtIn = PRODUCTS.map((p) => applyProductPatch(p, overrides[p.id]));
  return { configured: isDbConfigured(), products: [...custom, ...builtIn] };
}

/** One product (built-in or admin-added, any status/category) with saved edits applied — for the admin edit form. */
export async function getAdminProduct(id: string): Promise<{ configured: boolean; product: Product | null; hasOverride: boolean; isCustom: boolean }> {
  const configured = isDbConfigured();
  const base = PRODUCTS.find((p) => p.id === id) ?? null;
  if (base) {
    const overrides = await fetchAllProductOverrides();
    const patch = overrides[id];
    return { configured, product: applyProductPatch(base, patch), hasOverride: Boolean(patch && Object.keys(patch).length), isCustom: false };
  }
  const custom = await getCustomProduct(id);
  if (custom) return { configured, product: custom, hasOverride: false, isCustom: true };
  return { configured, product: null, hasOverride: false, isCustom: false };
}
