import { NextResponse } from "next/server";
import { sendNotification } from "@/lib/mailer";

export const runtime = "nodejs";

interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  productRef?: string;
  company_website?: string; // honeypot
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export async function POST(req: Request) {
  let body: Partial<ContactBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields, real users never see them.
  if (body.company_website) return NextResponse.json({ ok: true });

  const name = (body.name || "").toString().slice(0, 120).trim();
  const email = (body.email || "").toString().slice(0, 120).trim();
  const message = (body.message || "").toString().slice(0, 4000).trim();
  const subject = (body.subject || "General enquiry").toString().slice(0, 160).trim();
  const phone = (body.phone || "").toString().slice(0, 20).trim();
  const productRef = (body.productRef || "").toString().slice(0, 200).trim();

  if (!name || !isEmail(email) || !message) {
    return NextResponse.json({ ok: false, error: "Please fill in your name, a valid email, and a message." }, { status: 400 });
  }

  const html = `
    <h2>New contact message — BeyondWear</h2>
    <p><b>Name:</b> ${escapeHtml(name)}</p>
    <p><b>Email:</b> ${escapeHtml(email)}</p>
    ${phone ? `<p><b>Phone:</b> ${escapeHtml(phone)}</p>` : ""}
    <p><b>Subject:</b> ${escapeHtml(subject)}</p>
    ${productRef ? `<p><b>Regarding:</b> ${escapeHtml(productRef)}</p>` : ""}
    <p><b>Message:</b></p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `.trim();

  const result = await sendNotification({ subject: `New message: ${subject}`, html, replyTo: email });
  // Even if email isn't configured yet, don't fail the customer's submission —
  // just tell the caller so it can fall back (e.g. to local storage).
  return NextResponse.json({ ok: true, emailSent: result.ok, emailSkipped: result.skipped ?? false });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
