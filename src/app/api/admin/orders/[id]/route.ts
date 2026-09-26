import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { FullOrderStatus, OrderStatusEvent } from "@/lib/types";

export const runtime = "nodejs";

const STATUSES = new Set<FullOrderStatus>(["placed", "confirmed", "packed", "shipped", "out-for-delivery", "delivered", "cancelled"]);

/** Updates an order's real status and appends a timestamped entry to its history — shown to both admin and customer. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const { id } = await params;

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const status = body.status as FullOrderStatus;
  if (!status || !STATUSES.has(status)) return NextResponse.json({ ok: false, error: "Unknown status." }, { status: 400 });

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "Database not connected yet." }, { status: 503 });

  const { data: existing, error: fetchError } = await db.from("orders").select("status_history").eq("id", id).maybeSingle();
  if (fetchError) return NextResponse.json({ ok: false, error: fetchError.message }, { status: 500 });
  if (!existing) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

  const history: OrderStatusEvent[] = Array.isArray(existing.status_history) ? existing.status_history : [];
  // Re-setting the same status (e.g. re-clicking) doesn't duplicate the timeline entry.
  const nextHistory = history.length && history[history.length - 1].status === status ? history : [...history, { status, at: new Date().toISOString() }];

  const { error } = await db.from("orders").update({ status, status_history: nextHistory }).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status, statusHistory: nextHistory });
}
