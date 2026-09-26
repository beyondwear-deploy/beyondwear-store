/**
 * CUSTOM PRODUCTS — full listings an admin adds from scratch via
 * "Add new product" (/admin/products/new), stored entirely in Supabase
 * rather than as a patch on top of the built-in demo catalogue. See
 * src/lib/productPatch.ts for the built-in-product patch system this
 * complements.
 */
import { randomBytes } from "crypto";
import { slugify } from "@/lib/format";
import { getSupabaseAdmin, isDbConfigured } from "@/lib/supabase";
import { applyProductPatch, type ProductPatch } from "@/lib/productPatch";
import type { Category, Condition, Gender, Product, ProductImage } from "@/lib/types";

export interface NewProductInput {
  name: string;
  brand: string;
  category: Category;
  gender: Gender;
  type: string;
  size: string;
  color: string;
  colorHex: string;
  condition: Condition;
  price: number;
  originalPrice?: number | null;
  description: string;
  conditionNotes: string[];
  wearNote: string;
  material: string;
  stock: number;
  status: Product["status"];
  images: { url: string; alt?: string }[];
}

function genId(): string {
  return "c" + randomBytes(4).toString("hex");
}

const VIEW_CYCLE = ["front", "back", "side", "detail", "label", "wear"] as const;

/** Builds a full Product record from an admin's "Add new product" submission. */
export function buildCustomProduct(input: NewProductInput): Product {
  const id = genId();
  const slugBase = slugify(`${input.brand} ${input.name} ${input.color} size ${input.size}`) || id;
  const images: ProductImage[] = input.images.map((img, i) => ({
    view: VIEW_CYCLE[i % VIEW_CYCLE.length],
    alt: img.alt?.trim() || `${input.brand} ${input.name} in ${input.color}`,
    src: img.url,
  }));
  return {
    id,
    sku: `SEQ-CUSTOM-${id.slice(1, 7).toUpperCase()}`,
    slug: `${slugBase}-${id.slice(1, 5)}`,
    name: input.name,
    brand: input.brand,
    category: input.category,
    gender: input.gender,
    type: input.type,
    size: input.size,
    color: input.color,
    colorHex: input.colorHex || "#1c1b19",
    condition: input.condition,
    price: input.price,
    originalPrice: input.originalPrice ?? undefined,
    description: input.description,
    conditionNotes: input.conditionNotes,
    wearNote: input.wearNote,
    measurements: [],
    material: input.material,
    authenticity: { checked: true, note: "Reviewed against brand labelling, stitching, hardware and production codes before listing." },
    stock: input.stock,
    status: input.status,
    addedAt: new Date().toISOString(),
    popularity: 50,
    keywords: [input.type, input.color, input.material].filter(Boolean).map((s) => s.toLowerCase()),
    images,
    // Never rendered as long as every image above has a src (it always does for custom products).
    art: { garment: "sneaker", color: input.colorHex || "#1c1b19", color2: "#eeeae0" },
  };
}

export async function fetchCustomProducts(): Promise<Product[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db.from("custom_products").select("data").order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as { data: Product }[]).map((row) => row.data);
}

export async function getCustomProduct(id: string): Promise<Product | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.from("custom_products").select("data").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return (data as { data: Product }).data;
}

export async function insertCustomProduct(input: NewProductInput): Promise<{ ok: true; product: Product } | { ok: false; error: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "Database not connected yet." };
  const product = buildCustomProduct(input);
  const { error } = await db.from("custom_products").insert({ id: product.id, data: product });
  if (error) return { ok: false, error: error.message };
  return { ok: true, product };
}

/** Merges a patch (same shape used for built-in products) onto an existing custom product and saves the full result. */
export async function updateCustomProduct(id: string, patch: ProductPatch): Promise<{ ok: true; product: Product } | { ok: false; error: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "Database not connected yet." };
  const existing = await getCustomProduct(id);
  if (!existing) return { ok: false, error: "Product not found." };
  const merged = applyProductPatch(existing, patch);
  const { error } = await db.from("custom_products").update({ data: merged, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, product: merged };
}

export async function deleteCustomProduct(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "Database not connected yet." };
  const { error } = await db.from("custom_products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export { isDbConfigured };
