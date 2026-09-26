import { NextResponse } from "next/server";
import { checkCredentials, createAdminSession, isAdminAuthConfigured } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin login isn't set up yet. Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SESSION_SECRET in your environment variables (see ADMIN_SETUP.md), then redeploy." },
      { status: 503 },
    );
  }
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const { email, password } = body;
  if (!email || !password) return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });

  if (!checkCredentials(email, password)) {
    return NextResponse.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
