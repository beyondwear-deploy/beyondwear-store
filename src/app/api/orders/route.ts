import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

interface OrderBody {
  id: string;
  placedAt: string;
  customer: { fullName: string; phone: string; email: string };
  shipping: Record<string, unknown>;
  deliveryMethod: string;
  paymentMethod: string;
  paymentStatus: string;
  items: unknown[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCode?: string;
}

/**
 * Persists a placed order to the database (the real, durable order record).
 * Called fire-and-forget from lib/adapters/orders.ts right after checkout,
 * alongside the existing order-notify email. If the database isn't
 * connected yet this safely no-ops — checkout never depends on it.
 */
export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, skipped: true, error: "Database not configured yet." }, { status: 200 });

  let order: Partial<OrderBody>;
  try {
    order = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (!order.id || !order.customer || !Array.isArray(order.items)) {
    return NextResponse.json({ ok: false, error: "Malformed order payload." }, { status: 400 });
  }

  const { error } = await db.from("orders").upsert(
    {
      id: order.id,
      placed_at: order.placedAt ?? new Date().toISOString(),
      customer: order.customer,
      shipping: order.shipping ?? {},
      delivery_method: order.deliveryMethod ?? "standard",
      payment_method: order.paymentMethod ?? "cod",
      payment_status: order.paymentStatus ?? "pending",
      items: order.items,
      subtotal: order.subtotal ?? 0,
      discount: order.discount ?? 0,
      delivery_fee: order.deliveryFee ?? 0,
      total: order.total ?? 0,
      promo_code: order.promoCode ?? null,
      status: "placed",
      status_history: [{ status: "placed", at: order.placedAt ?? new Date().toISOString() }],
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[api/orders] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
