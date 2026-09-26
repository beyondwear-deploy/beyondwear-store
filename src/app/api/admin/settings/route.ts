import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getStoreSettings, updateStoreSettings } from "@/lib/storeSettings";

export const runtime = "nodejs";

/** The store's financial settings — starting capital and default cost price. */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const { configured, settings } = await getStoreSettings();
  return NextResponse.json({ ok: true, configured, settings });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  let body: { startingCapital?: number; defaultCostPrice?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (body.startingCapital !== undefined && (!Number.isFinite(body.startingCapital) || body.startingCapital < 0)) return NextResponse.json({ ok: false, error: "Starting capital looks wrong." }, { status: 400 });
  if (body.defaultCostPrice !== undefined && (!Number.isFinite(body.defaultCostPrice) || body.defaultCostPrice < 0)) return NextResponse.json({ ok: false, error: "Default cost price looks wrong." }, { status: 400 });

  const result = await updateStoreSettings(body);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 503 });
  return NextResponse.json({ ok: true });
}
