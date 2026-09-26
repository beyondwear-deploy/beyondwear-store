/**
 * ADMIN AUTH — a single-owner login (no user accounts, no third-party auth
 * service to sign up for). The password lives only in an environment
 * variable; a successful login issues a signed, httpOnly session cookie.
 *
 * Setup: set these in Vercel → Settings → Environment Variables:
 *   ADMIN_EMAIL            — the email you'll log in with
 *   ADMIN_PASSWORD         — the password you'll log in with (pick a strong one)
 *   ADMIN_SESSION_SECRET   — any long random string (used to sign the cookie,
 *                            e.g. generate one at random.org or run
 *                            `openssl rand -hex 32` locally)
 */
import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "bw_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "beyondwear-dev-secret-change-me";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Checks submitted credentials against ADMIN_EMAIL / ADMIN_PASSWORD. */
export function checkCredentials(email: string, password: string): boolean {
  const wantEmail = process.env.ADMIN_EMAIL;
  const wantPassword = process.env.ADMIN_PASSWORD;
  if (!wantEmail || !wantPassword) return false;
  const emailOk = email.trim().toLowerCase() === wantEmail.trim().toLowerCase();
  const passOk = timingSafeEqual(password, wantPassword);
  return emailOk && passOk;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

/** Builds a signed "expiry.signature" token to store in the session cookie. */
function makeToken(): string {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!timingSafeEqual(sig, sign(payload))) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && Date.now() < expires;
}

/** Call from a Server Action / Route Handler after checkCredentials() succeeds. */
export async function createAdminSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Server-side check — use in Server Components, layouts and API routes. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}
