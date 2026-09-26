import { NextResponse } from "next/server";
import { PRODUCTS } from "@/data/products";
import { isAdmin } from "@/lib/adminAuth";
import { deleteCustomProduct, updateCustomProduct } from "@/lib/customProducts";
import { getAdminProduct } from "@/lib/productOverrides";
import type { ProductPatch } from "@/lib/productPatch";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const CONDITIONS = new Set(["new", "like-new", "excellent", "good", "fair"]);
const STATUSES = new Set(["active", "draft", "archived"]);

function validate(patch: ProductPatch): string | null {
  if (patch.name !== undefined && (!patch.name.trim() || patch.name.length > 200)) return "Name looks wrong.";
  if (patch.brand !== undefined && (!patch.brand.trim() || patch.brand.length > 100)) return "Brand looks wrong.";
  if (patch.price !== undefined && (!Number.isFinite(patch.price) || patch.price < 0 || patch.price > 100000000)) return "Price looks wrong.";
  if (patch.originalPrice !== undefined && patch.originalPrice !== null && (!Number.isFinite(patch.originalPrice) || patch.originalPrice < 0)) return "Original price looks wrong.";
  if (patch.stock !== undefined && (!Number.isInteger(patch.stock) || patch.stock < 0 || patch.stock > 100000)) return "Stock looks wrong.";
  if (patch.description !== undefined && patch.description.length > 5000) return "Description is too long.";
  if (patch.condition !== undefined && !CONDITIONS.has(patch.condition)) return "Unknown condition.";
  if (patch.status !== undefined && !STATUSES.has(patch.status)) return "Unknown status.";
  if (patch.conditionNotes !== undefined && (!Array.isArray(patch.conditionNotes) || patch.conditionNotes.length > 20)) return "Condition notes look wrong.";
  if (patch.measurements !== undefined) {
    if (!Array.isArray(patch.measurements) || patch.measurements.length > 20) return "Measurements look wrong.";
    for (const m of patch.measurements) if (typeof m?.label !== "string" || typeof m?.value !== "string") return "Measurements look wrong.";
  }
  if (patch.images !== undefined) {
    if (!Array.isArray(patch.images) || patch.images.length > 12) return "Photos look wrong.";
    for (const img of patch.images) if (typeof img?.view !== "string" || typeof img?.alt !== "string") return "Photos look wrong.";
  }
  return null;
}

/** One product (built-in or admin-added), with saved edits applied — for the /admin/products/[id] edit form. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const { configured, product, hasOverride, isCustom } = await getAdminProduct(id);
  if (!product) return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });
  return NextResponse.json({ ok: true, configured, product, hasOverride, isCustom });
}

/** Saves an admin's edits to one product (price, photos, name, specs, condition, description, stock, status). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const isBuiltIn = PRODUCTS.some((p) => p.id === id);

  let patch: ProductPatch;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const problem = validate(patch);
  if (problem) return NextResponse.json({ ok: false, error: problem }, { status: 400 });

  if (!isBuiltIn) {
    const result = await updateCustomProduct(id, patch);
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: result.error.includes("not found") ? 404 : 500 });
    return NextResponse.json({ ok: true });
  }

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "Database not connected yet — see ADMIN_SETUP.md." }, { status: 503 });

  const { error } = await db
    .from("product_overrides")
    .upsert({ product_id: id, patch, updated_at: new Date().toISOString() }, { onConflict: "product_id" });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Built-in product: resets it back to its original built-in details. Admin-added product: deletes it entirely. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const isBuiltIn = PRODUCTS.some((p) => p.id === id);

  if (!isBuiltIn) {
    const result = await deleteCustomProduct(id);
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "Database not connected yet." }, { status: 503 });

  const { error } = await db.from("product_overrides").delete().eq("product_id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
