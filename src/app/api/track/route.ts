import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Server-side order lookup for the public "Track order" page. Needed because
 * orders live in the database, not in the browser that's asking — a real
 * store's tracking has to work from any device, not just the one that
 * checked out. Requires the exact order id AND the email/phone from
 * checkout, same as the client-side demo lookup this backs up.
 */
export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, found: false, configured: false }, { status: 200 });

  let body: { id?: string; contact?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const id = (body.id ?? "").trim();
  const contact = (body.contact ?? "").trim().toLowerCase();
  if (!id || !contact) return NextResponse.json({ ok: false, error: "Missing order number or contact." }, { status: 400 });

  const { data, error } = await db.from("orders").select("*").ilike("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ ok: true, found: false, configured: true });

  const customer = data.customer as { email?: string; phone?: string } | null;
  const email = (customer?.email ?? "").toLowerCase();
  const digits = contact.replace(/\D/g, "");
  const phoneDigits = (customer?.phone ?? "").replace(/\D/g, "");
  const matches = email === contact || (digits.length >= 6 && phoneDigits.endsWith(digits.slice(-7)));
  if (!matches) return NextResponse.json({ ok: true, found: false, configured: true });

  return NextResponse.json({
    ok: true,
    found: true,
    configured: true,
    order: {
      id: data.id,
      placedAt: data.placed_at,
      customer: data.customer,
      shipping: data.shipping,
      deliveryMethod: data.delivery_method,
      paymentMethod: data.payment_method,
      paymentStatus: data.payment_status,
      items: data.items,
      subtotal: Number(data.subtotal) || 0,
      discount: Number(data.discount) || 0,
      deliveryFee: Number(data.delivery_fee) || 0,
      total: Number(data.total) || 0,
      promoCode: data.promo_code ?? undefined,
      dbStatus: data.status,
      statusHistory: Array.isArray(data.status_history) ? data.status_history : [],
    },
  });
}
