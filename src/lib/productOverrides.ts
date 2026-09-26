/**
 * PRODUCT OVERRIDES — server-side reads/writes for full product editing
 * (price, photos, name, specs/measurements, condition, description, stock,
 * status). Mirrors lib/content.ts's pattern, one row per product id.
 */
import { PRODUCTS } from "@/data/products";
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

/** Every product (including draft/archived/not-yet-live categories) with saved edits applied — for the admin products list. */
export async function getAdminProductList(): Promise<{ configured: boolean; products: Product[] }> {
  const overrides = await fetchAllProductOverrides();
  const products = PRODUCTS.map((p) => applyProductPatch(p, overrides[p.id]));
  return { configured: isDbConfigured(), products };
}

/** One product (any status/category) with saved edits applied — for the admin edit form. */
export async function getAdminProduct(id: string): Promise<{ configured: boolean; product: Product | null; hasOverride: boolean }> {
  const base = PRODUCTS.find((p) => p.id === id) ?? null;
  const configured = isDbConfigured();
  if (!base) return { configured, product: null, hasOverride: false };
  const overrides = await fetchAllProductOverrides();
  const patch = overrides[id];
  return { configured, product: applyProductPatch(base, patch), hasOverride: Boolean(patch && Object.keys(patch).length) };
}
