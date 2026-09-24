/**
 * AUTH (local demo adapter).
 * Accounts are stored in this browser only and passwords are salted+SHA-256
 * hashed with WebCrypto. This exists so the whole account flow works with no
 * backend. FOR PRODUCTION swap this module for Supabase Auth
 * (`supabase.auth.signUp / signInWithPassword / resetPasswordForEmail`) —
 * the function signatures below are intentionally the same shape.
 */
import type { User } from "@/lib/types";

const KEY = "beyondwear.users";
interface StoredUser extends User { salt: string; hash: string }

export type AuthResult<T = User> = { ok: true; data: T } | { ok: false; error: string; field?: string };

const read = (): StoredUser[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};
const write = (u: StoredUser[]) => localStorage.setItem(KEY, JSON.stringify(u));

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const randomSalt = () => Array.from(crypto.getRandomValues(new Uint8Array(12))).map((b) => b.toString(16).padStart(2, "0")).join("");
const strip = ({ salt: _s, hash: _h, ...user }: StoredUser): User => user;

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => /^[+()\d][\d\s\-()+]{8,17}$/.test(v.trim());
export function passwordIssue(pw: string): string | null {
  if (pw.length < 8) return "Use at least 8 characters.";
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return "Include at least one letter and one number.";
  return null;
}

let fails = 0;
let lockedUntil = 0;

export async function register(input: { fullName: string; email: string; phone?: string; password: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  if (read().some((u) => u.email === email)) return { ok: false, error: "An account with this email already exists. Try signing in.", field: "email" };
  const salt = randomSalt();
  const user: StoredUser = {
    id: crypto.randomUUID(), fullName: input.fullName.trim(), email, phone: input.phone?.trim(),
    createdAt: new Date().toISOString(), addresses: [], salt, hash: await sha256(salt + input.password),
  };
  write([...read(), user]);
  return { ok: true, data: strip(user) };
}

export async function login(emailRaw: string, password: string): Promise<AuthResult> {
  if (Date.now() < lockedUntil) return { ok: false, error: `Too many attempts. Try again in ${Math.ceil((lockedUntil - Date.now()) / 1000)}s.` };
  const email = emailRaw.trim().toLowerCase();
  const u = read().find((x) => x.email === email);
  const ok = u && (await sha256(u.salt + password)) === u.hash;
  if (!u || !ok) {
    if (++fails >= 5) { lockedUntil = Date.now() + 30000; fails = 0; }
    return { ok: false, error: "Incorrect email or password." };
  }
  fails = 0;
  return { ok: true, data: strip(u) };
}

export async function requestPasswordReset(emailRaw: string): Promise<AuthResult<null>> {
  // Always succeed with the same message so account existence is never revealed.
  // Production: supabase.auth.resetPasswordForEmail(email)
  await new Promise((r) => setTimeout(r, 500));
  void emailRaw;
  return { ok: true, data: null };
}

export function persistUserPatch(user: User) {
  const all = read();
  write(all.map((u) => (u.id === user.id ? { ...u, ...user } : u)));
}
