/**
 * PRODUCT PATCH — the subset of a Product's fields an admin can change from
 * /admin/products. Everything else (id, slug, sku, category, gender, type,
 * size, color, colorHex, addedAt, popularity, keywords, art, authenticity)
 * stays fixed so routing, filtering, search and the generated-art fallback
 * keep working exactly as before. Pure functions only — safe to import from
 * both server and client code (no "use client" involved anywhere here).
 */
import type { Condition, Measurement, Product, ProductImage } from "./types";

export interface ProductPatch {
  name?: string;
  brand?: string;
  price?: number;
  /** null clears the "was" price entirely (no strike-through shown). */
  originalPrice?: number | null;
  description?: string;
  condition?: Condition;
  conditionNotes?: string[];
  wearNote?: string;
  material?: string;
  measurements?: Measurement[];
  stock?: number;
  status?: Product["status"];
  images?: ProductImage[];
  /** null clears the per-product override, so it falls back to the store's default cost price. */
  costPrice?: number | null;
}

export const EDITABLE_FIELDS = [
  "name", "brand", "price", "originalPrice", "description", "condition",
  "conditionNotes", "wearNote", "material", "measurements", "stock", "status", "images", "costPrice",
] as const;

/** Merges a saved patch on top of a built-in product. Returns the base unchanged if there's no patch. */
export function applyProductPatch(base: Product, patch?: ProductPatch | null): Product {
  if (!patch || Object.keys(patch).length === 0) return base;
  const merged: Product = { ...base, ...patch } as Product;
  if (patch.originalPrice === null) merged.originalPrice = undefined;
  if (patch.costPrice === null) merged.costPrice = undefined;
  if (!patch.images || patch.images.length === 0) merged.images = base.images;
  return merged;
}

export interface ProductPatchSnapshot {
  name: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  description: string;
  condition: Condition;
  conditionNotes: string[];
  wearNote: string;
  material: string;
  measurements: Measurement[];
  stock: number;
  status: Product["status"];
  images: ProductImage[];
  costPrice: number | null;
}

/** The current, editable-field snapshot a product edit form starts from (already-applied overrides + built-in defaults). */
export function toPatch(p: Product): ProductPatchSnapshot {
  return {
    name: p.name,
    brand: p.brand,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    description: p.description,
    condition: p.condition,
    conditionNotes: p.conditionNotes,
    wearNote: p.wearNote,
    material: p.material,
    measurements: p.measurements,
    stock: p.stock,
    status: p.status,
    images: p.images,
    costPrice: p.costPrice ?? null,
  };
}
