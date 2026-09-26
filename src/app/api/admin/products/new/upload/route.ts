import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Uploads a photo for a brand-new product that doesn't have an id yet (the "Add new product" form). Returns a public URL to include when creating the product. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "Database not connected yet — see ADMIN_SETUP.md." }, { status: 503 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "Missing file." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ ok: false, error: "Only JPG, PNG, WEBP or GIF images are allowed." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "Image is larger than 8MB." }, { status: 400 });

  const ext = file.type.split("/")[1] || "jpg";
  const path = `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await db.storage.from("product-images").upload(path, bytes, { contentType: file.type, upsert: true });
  if (uploadError) return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });

  const { data: pub } = db.storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: pub.publicUrl });
}
