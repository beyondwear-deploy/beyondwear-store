/**
 * STORE SETTINGS — the two store-wide financial inputs everything else is
 * derived from: the default per-pair cost price (used whenever a product
 * doesn't have its own cost price set) and the one-time starting capital
 * figure the Balance Sheet / Cash Flow statement are built on. Both are
 * editable from admin → Financials → Settings; every report is computed
 * live from these, never hand-typed. See supabase/schema.sql for the
 * single-row `store_settings` table this reads/writes.
 */
import { getSupabaseAdmin } from "@/lib/supabase";

export const DEFAULT_COST_PRICE = 1260;

export interface StoreSettings {
  startingCapital: number;
  defaultCostPrice: number;
}

const FALLBACK: StoreSettings = { startingCapital: 0, defaultCostPrice: DEFAULT_COST_PRICE };

export async function getStoreSettings(): Promise<{ configured: boolean; settings: StoreSettings }> {
  const db = getSupabaseAdmin();
  if (!db) return { configured: false, settings: FALLBACK };
  const { data, error } = await db.from("store_settings").select("starting_capital, default_cost_price").eq("id", 1).maybeSingle();
  if (error || !data) return { configured: true, settings: FALLBACK };
  return {
    configured: true,
    settings: {
      startingCapital: Number(data.starting_capital) || 0,
      defaultCostPrice: Number(data.default_cost_price) || DEFAULT_COST_PRICE,
    },
  };
}

export async function updateStoreSettings(patch: Partial<StoreSettings>): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "Database not connected yet." };
  const row: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() };
  if (patch.startingCapital !== undefined) row.starting_capital = patch.startingCapital;
  if (patch.defaultCostPrice !== undefined) row.default_cost_price = patch.defaultCostPrice;
  const { error } = await db.from("store_settings").upsert(row, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** The cost price to use for a product: its own override if set, else the store default. */
export function effectiveCostPrice(productCostPrice: number | undefined, defaultCostPrice: number): number {
  return productCostPrice ?? defaultCostPrice;
}
