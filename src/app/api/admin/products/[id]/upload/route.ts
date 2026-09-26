import { NextResponse } from "next/server";
import { PRODUCTS } from "@/data/products";
import { isAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Uploads a product photo (for a given image view — front/back/side/detail/label/wear) to Supabase Storage and returns its public URL. Saving it against the product happens client-side via POST /api/admin/products/[id] once all fields are ready. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  if (!PRODUCTS.some((p) => p.id === id)) return NextResponse.json({ ok: false, error: "Product not found." }, { status: 404 });

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "Database not connected yet — see ADMIN_SETUP.md." }, { status: 503 });

  const form = await req.formData();
  const file = form.get("file");
  const view = form.get("view");
  if (!(file instanceof File) || typeof view !== "string" || !view) {
    return NextResponse.json({ ok: false, error: "Missing file or image slot." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ ok: false, error: "Only JPG, PNG, WEBP or GIF images are allowed." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "Image is larger than 8MB." }, { status: 400 });

  const ext = file.type.split("/")[1] || "jpg";
  const path = `${id}-${view.replace(/[^a-zA-Z0-9._-]/g, "_")}-${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await db.storage.from("product-images").upload(path, bytes, { contentType: file.type, upsert: true });
  if (uploadError) return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });

  const { data: pub } = db.storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: pub.publicUrl });
}
