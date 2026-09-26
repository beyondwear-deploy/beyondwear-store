/**
 * SUPABASE (server-only) — free Postgres + Storage backend for orders,
 * traffic analytics and the inline content editor.
 *
 * Setup (free, ~10 minutes, no card required): see ADMIN_SETUP.md.
 *   1. Create a project at supabase.com (free tier).
 *   2. Project Settings → API → copy the Project URL and the two keys.
 *   3. In Vercel → your project → Settings → Environment Variables, add:
 *        NEXT_PUBLIC_SUPABASE_URL
 *        NEXT_PUBLIC_SUPABASE_ANON_KEY
 *        SUPABASE_SERVICE_ROLE_KEY   (server-only — never expose to the client)
 *   4. SQL Editor → paste supabase/schema.sql → Run.
 *   5. Redeploy.
 *
 * Until those env vars are set, every function below safely returns null /
 * empty data instead of throwing, so the site and admin dashboard keep
 * working (with an on-screen "connect your database" notice) rather than
 * crashing — same resilience pattern as lib/mailer.ts.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/** Server-only client using the service role key (full read/write, bypasses RLS). Never import from a client component. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[supabase] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured — database features are disabled until set.");
    cached = null;
    return null;
  }
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}

export const isDbConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
