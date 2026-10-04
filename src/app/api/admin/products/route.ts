import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { insertCustomProduct, type NewProductInput } from "@/lib/customProducts";
import { getAdminProductList } from "@/lib/productOverrides";
import { CATEGORIES, GENDERS } from "@/lib/catalog";

export const runtime = "nodejs";

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const GENDER_IDS = new Set(GENDERS.map((g) => g.id));
const CONDITIONS = new Set(["new", "like-new", "excellent", "good", "fair"]);
const STATUSES = new Set(["active", "draft", "archived"]);

function validate(input: Partial<NewProductInput>): string | null {
  if (!input.name?.trim()) return "Name is required.";
  if (!input.category || !CATEGORY_IDS.has(input.category)) return "Pick a valid category.";
  if (!input.gender || !GENDER_IDS.has(input.gender)) return "Pick a valid gender.";
  if (!input.condition || !CONDITIONS.has(input.condition)) return "Pick a valid condition.";
  // Everything except the name is optional — blank text fields are fine.
  if (typeof input.price !== "number" || !Number.isFinite(input.price) || input.price < 0) return "Price looks wrong.";
  if (input.originalPrice != null && (!Number.isFinite(input.originalPrice) || input.originalPrice < 0)) return "Original price looks wrong.";
  if (typeof input.stock !== "number" || !Number.isInteger(input.stock) || input.stock < 0) return "Stock looks wrong.";
  if (!input.status || !STATUSES.has(input.status)) return "Pick a valid status.";
  if (!Array.isArray(input.images)) return "Invalid photos.";
  if (input.status === "active" && input.images.length === 0) return "Add at least one photo before making a product Active (or save it as a Draft).";
  if (input.images.length > 6) return "Up to 6 photos.";
  for (const img of input.images) if (typeof img?.url !== "string" || !img.url) return "One of the photos didn't upload correctly — try again.";
  if (input.costPrice != null && (!Number.isFinite(input.costPrice) || input.costPrice < 0)) return "Cost price looks wrong.";
  return null;
}

/** Lists every product (any status/category, including admin-added listings) with saved edits applied — used by the /admin/products list page. */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const { configured, products } = await getAdminProductList();
  return NextResponse.json({ ok: true, configured, products });
}

/** Creates a brand-new product listing (the "Add new product" form). */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  let input: Partial<NewProductInput>;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const problem = validate(input);
  if (problem) return NextResponse.json({ ok: false, error: problem }, { status: 400 });

  const t = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const result = await insertCustomProduct({
    ...(input as NewProductInput),
    brand: t(input.brand), type: t(input.type), size: t(input.size), color: t(input.color),
    description: t(input.description), material: t(input.material),
    conditionNotes: Array.isArray(input.conditionNotes) ? input.conditionNotes.filter(Boolean) : [],
    wearNote: input.wearNote?.trim() || "No wear noted",
  });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 503 });
  return NextResponse.json({ ok: true, id: result.product.id, slug: result.product.slug });
}
