/**
 * CONTENT OVERRIDES — server-side reads for the inline "click Edit → Save"
 * editor. Each editable field on the site has a stable string key (e.g.
 * "announcement.0", "about.story.p1"); a saved override replaces the
 * hard-coded default text/image for everyone, everywhere, immediately.
 */
import { getSupabaseAdmin } from "@/lib/supabase";

export type ContentOverrides = Record<string, string>;

/** Fetches every saved override once per request. Empty map if the DB isn't connected yet. */
export async function getOverrides(): Promise<ContentOverrides> {
  const db = getSupabaseAdmin();
  if (!db) return {};
  const { data, error } = await db.from("content_overrides").select("key, value");
  if (error || !data) return {};
  const map: ContentOverrides = {};
  for (const row of data) map[row.key] = row.value;
  return map;
}
