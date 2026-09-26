import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const VISITOR_COOKIE = "bw_vid";
const SESSION_COOKIE = "bw_sid";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, anonymous id only — no PII
const SESSION_MAX_AGE = 60 * 30; // 30 min sliding window

function parseDevice(ua: string): { device: string; browser: string } {
  const isTablet = /iPad|Tablet/i.test(ua);
  const isMobile = !isTablet && /Mobi|Android|iPhone/i.test(ua);
  const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";
  let browser = "Other";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
  return { device, browser };
}

export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  const store = await cookies();

  // Assign (or read) an anonymous visitor id — no PII, just a random UUID.
  let visitorId = store.get(VISITOR_COOKIE)?.value;
  if (!visitorId) visitorId = crypto.randomUUID();

  let sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) sessionId = crypto.randomUUID();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: VISITOR_MAX_AGE });
  res.cookies.set(SESSION_COOKIE, sessionId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE });

  if (!db) return res; // analytics silently disabled until the database is connected

  let body: { path?: string; referrer?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const path = typeof body.path === "string" ? body.path.slice(0, 300) : "/";
  const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
  const ua = req.headers.get("user-agent") ?? "";
  const { device, browser } = parseDevice(ua);

  await db.from("page_views").insert({
    path,
    referrer: referrer || null,
    device,
    browser,
    visitor_id: visitorId,
    session_id: sessionId,
  });

  return res;
}
