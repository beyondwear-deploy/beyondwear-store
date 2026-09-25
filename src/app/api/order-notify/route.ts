import { NextResponse } from "next/server";
import { sendNotification } from "@/lib/mailer";

export const runtime = "nodejs";

interface OrderItemBody { name: string; brand: string; size: string; color: string; price: number; qty: number }
interface OrderBody {
  id: string;
  customer: { fullName: string; phone: string; email: string };
  shipping: { address: string; city: string; province: string; postalCode?: string };
  deliveryMethod: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItemBody[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCode?: string;
}

/**
 * Fired (fire-and-forget) right after an order is placed on the client.
 * This exists because there is no database yet — this email IS the order
 * record until Supabase (or another backend) is connected. Treat these
 * emails as your order log for now.
 */
export async function POST(req: Request) {
  let order: Partial<OrderBody>;
  try {
    order = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!order.id || !order.customer || !Array.isArray(order.items)) {
    return NextResponse.json({ ok: false, error: "Malformed order payload." }, { status: 400 });
  }

  const rows = order.items
    .map((i) => `<tr><td style="padding:4px 10px 4px 0">${esc(i.brand)} ${esc(i.name)}</td><td style="padding:4px 10px">${esc(i.size)} · ${esc(i.color)}</td><td style="padding:4px 10px">×${i.qty}</td><td style="padding:4px 0;text-align:right">Rs ${(i.price * i.qty).toLocaleString()}</td></tr>`)
    .join("");

  const html = `
    <h2>New order — ${esc(order.id)}</h2>
    <p><b>Customer:</b> ${esc(order.customer.fullName)} · ${esc(order.customer.phone)} · ${esc(order.customer.email)}</p>
    <p><b>Ship to:</b> ${esc(order.shipping?.address ?? "")}, ${esc(order.shipping?.city ?? "")}, ${esc(order.shipping?.province ?? "")} ${esc(order.shipping?.postalCode ?? "")}</p>
    <p><b>Delivery:</b> ${esc(order.deliveryMethod ?? "")} &nbsp; <b>Payment:</b> ${esc(order.paymentMethod ?? "")} (${esc(order.paymentStatus ?? "")})</p>
    <table style="border-collapse:collapse;margin-top:12px">${rows}</table>
    <p style="margin-top:12px">
      Subtotal: Rs ${(order.subtotal ?? 0).toLocaleString()}<br/>
      ${order.discount ? `Discount: -Rs ${order.discount.toLocaleString()}${order.promoCode ? ` (${esc(order.promoCode)})` : ""}<br/>` : ""}
      Delivery fee: Rs ${(order.deliveryFee ?? 0).toLocaleString()}<br/>
      <b>Total: Rs ${(order.total ?? 0).toLocaleString()}</b>
    </p>
    <p style="color:#888;font-size:12px;margin-top:16px">This email is currently your order record — there's no database connected yet, so keep these for your books until that's set up.</p>
  `.trim();

  const result = await sendNotification({ subject: `New order ${order.id} — Rs ${(order.total ?? 0).toLocaleString()}`, html, replyTo: order.customer.email });
  return NextResponse.json({ ok: true, emailSent: result.ok, emailSkipped: result.skipped ?? false });
}

function esc(s: string) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
