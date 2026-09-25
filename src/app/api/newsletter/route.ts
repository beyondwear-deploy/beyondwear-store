import { NextResponse } from "next/server";
import { sendNotification } from "@/lib/mailer";

export const runtime = "nodejs";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export async function POST(req: Request) {
  let body: { email?: string; company_website?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (body.company_website) return NextResponse.json({ ok: true }); // honeypot

  const email = (body.email || "").toString().slice(0, 120).trim();
  if (!isEmail(email)) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });

  const result = await sendNotification({
    subject: "New newsletter signup — BeyondWear",
    html: `<p>New subscriber: <b>${email}</b></p><p style="color:#888;font-size:12px">Keep a running list of these — right now this email IS the record, since there's no database connected yet.</p>`,
  });

  return NextResponse.json({ ok: true, emailSent: result.ok, emailSkipped: result.skipped ?? false });
}
