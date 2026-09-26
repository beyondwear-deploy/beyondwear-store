import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/** Saves one editable field's new value. Used by <EditableText> / <EditableImage> "Save" button. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "Database not connected yet — see ADMIN_SETUP.md." }, { status: 503 });

  let body: { key?: string; type?: "text" | "image"; value?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const { key, type, value } = body;
  if (!key || !type || typeof value !== "string") return NextResponse.json({ ok: false, error: "Missing key, type or value." }, { status: 400 });
  if (value.length > 20000) return NextResponse.json({ ok: false, error: "That's too long to save." }, { status: 400 });

  const { error } = await db.from("content_overrides").upsert({ key, type, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Resets one editable field back to the site's built-in default (deletes its saved override). */
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "Database not connected yet." }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ ok: false, error: "Missing key." }, { status: 400 });

  const { error } = await db.from("content_overrides").delete().eq("key", key);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Lists every saved override — used by the admin "Edit content" page. */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: true, overrides: [] });
  const { data, error } = await db.from("content_overrides").select("key, type, value, updated_at").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, overrides: data ?? [] });
}
