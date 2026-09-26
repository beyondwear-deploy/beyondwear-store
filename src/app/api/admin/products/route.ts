import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getAdminProductList } from "@/lib/productOverrides";

export const runtime = "nodejs";

/** Lists every product (any status/category) with saved edits applied — used by the /admin/products list page. */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const { configured, products } = await getAdminProductList();
  return NextResponse.json({ ok: true, configured, products });
}
