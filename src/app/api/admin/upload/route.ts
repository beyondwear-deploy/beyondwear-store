import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Uploads a replacement image for <EditableImage> to Supabase Storage and returns its public URL. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "Database not connected yet — see ADMIN_SETUP.md." }, { status: 503 });

  const form = await req.formData();
  const file = form.get("file");
  const key = form.get("key");
  if (!(file instanceof File) || typeof key !== "string" || !key) {
    return NextResponse.json({ ok: false, error: "Missing file or key." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ ok: false, error: "Only JPG, PNG, WEBP or GIF images are allowed." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "Image is larger than 8MB." }, { status: 400 });

  const ext = file.type.split("/")[1] || "jpg";
  const path = `${key.replace(/[^a-zA-Z0-9._-]/g, "_")}-${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await db.storage.from("site-content").upload(path, bytes, { contentType: file.type, upsert: true });
  if (uploadError) return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });

  const { data: pub } = db.storage.from("site-content").getPublicUrl(path);
  const url = pub.publicUrl;

  const { error: dbError } = await db.from("content_overrides").upsert({ key, type: "image", value: url, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (dbError) return NextResponse.json({ ok: false, error: dbError.message }, { status: 500 });

  return NextResponse.json({ ok: true, url });
}
