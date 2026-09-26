/**
 * FINANCIALS — a simplified but internally-consistent single-owner,
 * cash-basis accounting model, built entirely from data the store actually
 * captures: real delivered orders, each product's cost price (per-product
 * override, else the store default), a manual expense log, and a one-time
 * starting capital figure. Every number here is computed live — nothing is
 * hand-typed — so it stays correct as orders, costs and expenses change.
 *
 * The model, in one place (see also supabase/schema.sql for the tables):
 *   Revenue            = total of orders marked Delivered (booked on delivery date)
 *   COGS               = cost price × qty, for items in delivered orders
 *   Gross profit       = Revenue − COGS
 *   Net profit         = Gross profit − Expenses
 *   Inventory value    = cost price × current stock, for every active/draft product on hand
 *   Cash               = Starting capital + Revenue − COGS − Inventory value − Expenses
 *   Balance sheet:  Assets (Cash + Inventory) = Liabilities (0, not tracked) + Equity
 *                   Equity = Starting capital + Retained earnings (= cumulative Net profit)
 *   Cash flow:      Financing = Starting capital (one-time)
 *                   Operating = Revenue − COGS − Inventory value − Expenses
 *                   Net       = Financing + Operating (matches Cash above)
 *
 * Liabilities aren't tracked (no supplier credit / loans captured yet), so
 * the balance sheet notes that explicitly rather than pretending they're 0
 * by omission.
 *
 * PERIOD FILTER — every report also accepts a Period (day/week/month/
 * quarter/year/all, see @/lib/period). It re-scopes the *activity* figures
 * — revenue, COGS, gross/net profit, delivered orders, expenses — to that
 * rolling window. Cash and the balance sheet stay all-time: they're a
 * point-in-time snapshot of what the store owns right now, not an activity
 * report, so "this week's balance sheet" would be misleading. The cash
 * flow statement follows the same rule: picking a period shows that
 * period's operating cash movement (revenue − COGS − expenses); "All time"
 * additionally includes the one-time starting-capital financing line and
 * the inventory-on-hand deduction, matching the cumulative cash position.
 */
import { getAdminProductList } from "@/lib/productOverrides";
import { getSupabaseAdmin } from "@/lib/supabase";
import { effectiveCostPrice, getStoreSettings } from "@/lib/storeSettings";
import { periodLabel, periodStart, type Period } from "@/lib/period";
import type { OrderItem } from "@/lib/types";

export type { Period };

export interface Expense {
  id: number;
  date: string; // YYYY-MM-DD
  category: string;
  amount: number;
  note: string | null;
}

const EXPENSE_CATEGORIES = ["Packaging", "Shipping", "Marketing", "Rent", "Utilities", "Wages", "Platform fees", "Other"] as const;
export { EXPENSE_CATEGORIES };

/* ------------------------------ expenses CRUD ------------------------------ */

export async function getExpenses(): Promise<{ configured: boolean; expenses: Expense[] }> {
  const db = getSupabaseAdmin();
  if (!db) return { configured: false, expenses: [] };
  const { data, error } = await db.from("expenses").select("id, date, category, amount, note").order("date", { ascending: false }).order("id", { ascending: false });
  if (error || !data) return { configured: true, expenses: [] };
  return { configured: true, expenses: data.map((e) => ({ id: e.id as number, date: e.date as string, category: e.category as string, amount: Number(e.amount) || 0, note: (e.note as string) ?? null })) };
}

export interface ExpenseInput { date: string; category: string; amount: number; note?: string | null }

export async function addExpense(input: ExpenseInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "Database not connected yet." };
  const { error } = await db.from("expenses").insert({ date: input.date, category: input.category, amount: input.amount, note: input.note || null });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateExpense(id: number, input: ExpenseInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "Database not connected yet." };
  const { error } = await db.from("expenses").update({ date: input.date, category: input.category, amount: input.amount, note: input.note || null, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteExpense(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "Database not connected yet." };
  const { error } = await db.from("expenses").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/* ------------------------------ summary ------------------------------ */

export interface MonthPoint { month: string; revenue: number; cogs: number; grossProfit: number; expenses: number; netProfit: number }

export interface InventoryLine { id: string; name: string; brand: string; stock: number; costPrice: number; value: number }

export interface FinancialSummary {
  configured: boolean;
  /** Which period this summary's activity figures (revenue…netProfit, deliveredOrders) are scoped to. */
  period: Period;
  periodLabel: string;
  startingCapital: number;
  defaultCostPrice: number;
  /** Delivered orders within the selected period. */
  deliveredOrders: number;
  /** Revenue, COGS, gross/net profit and expenses within the selected period. */
  revenue: number;
  cogs: number;
  grossProfit: number;
  expensesTotal: number;
  netProfit: number;
  /** All-time revenue/COGS/expenses/delivered-orders, unaffected by the period filter — used only to derive the cash position below. */
  allTime: { revenue: number; cogs: number; expensesTotal: number; deliveredOrders: number };
  /** Inventory and cash are always a snapshot as of now, not a period activity figure. */
  inventoryValue: number;
  inventoryUnits: number;
  inventoryLines: InventoryLine[];
  cash: number;
  monthly: MonthPoint[]; // trailing 12 calendar months, always all-time (unaffected by the period filter)
  balanceSheet: {
    assetsCash: number;
    assetsInventory: number;
    assetsTotal: number;
    liabilities: number;
    equityStartingCapital: number;
    equityRetainedEarnings: number;
    equityTotal: number;
  };
  cashFlow: {
    /** true for "All time" only — financing and the inventory line only make sense cumulatively. */
    allTimeView: boolean;
    financing: number;
    operatingRevenue: number;
    operatingCogs: number;
    operatingInventory: number;
    operatingExpenses: number;
    operatingNet: number;
    net: number;
  };
}

function last12Months(): string[] {
  const months: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 11; i >= 0; i--) {
    const m = new Date(d);
    m.setMonth(m.getMonth() - i);
    months.push(m.toISOString().slice(0, 7)); // YYYY-MM
  }
  return months;
}

function emptySummary(period: Period): FinancialSummary {
  return {
    configured: false, period, periodLabel: periodLabel(period), startingCapital: 0, defaultCostPrice: 0, deliveredOrders: 0,
    revenue: 0, cogs: 0, grossProfit: 0, expensesTotal: 0, netProfit: 0,
    allTime: { revenue: 0, cogs: 0, expensesTotal: 0, deliveredOrders: 0 },
    inventoryValue: 0, inventoryUnits: 0, inventoryLines: [], cash: 0, monthly: [],
    balanceSheet: { assetsCash: 0, assetsInventory: 0, assetsTotal: 0, liabilities: 0, equityStartingCapital: 0, equityRetainedEarnings: 0, equityTotal: 0 },
    cashFlow: { allTimeView: period === "all", financing: 0, operatingRevenue: 0, operatingCogs: 0, operatingInventory: 0, operatingExpenses: 0, operatingNet: 0, net: 0 },
  };
}

export async function getFinancialSummary(period: Period = "all"): Promise<FinancialSummary> {
  const db = getSupabaseAdmin();
  if (!db) return emptySummary(period);

  const [{ settings }, { products }, { data: orders, error: ordersError }, { expenses }] = await Promise.all([
    getStoreSettings(),
    getAdminProductList(),
    db.from("orders").select("total, status, status_history, items, placed_at").limit(5000),
    getExpenses(),
  ]);
  if (ordersError || !orders) return { ...emptySummary(period), configured: true };

  const costOf = new Map(products.map((p) => [p.id, effectiveCostPrice(p.costPrice, settings.defaultCostPrice)]));

  const now = new Date();
  const start = periodStart(period, now);
  const inPeriod = (iso: string) => !start || (new Date(iso).getTime() >= start.getTime() && new Date(iso).getTime() <= now.getTime());

  // All-time totals (used only for cash / balance sheet — a snapshot, not an activity report)
  // and, separately, totals scoped to the selected period (used for every other figure).
  let atRevenue = 0, atCogs = 0, atDeliveredOrders = 0;
  let revenue = 0, cogs = 0, deliveredOrders = 0;
  const byMonth = new Map<string, { revenue: number; cogs: number }>();

  for (const o of orders) {
    if (o.status !== "delivered") continue;
    const history = Array.isArray(o.status_history) ? (o.status_history as { status: string; at: string }[]) : [];
    const at = history.find((e) => e.status === "delivered")?.at ?? o.placed_at;
    const total = Number(o.total) || 0;
    const items = Array.isArray(o.items) ? (o.items as OrderItem[]) : [];
    const orderCogs = items.reduce((sum, it) => sum + (costOf.get(it.productId) ?? settings.defaultCostPrice) * (it.qty ?? 0), 0);

    atRevenue += total;
    atCogs += orderCogs;
    atDeliveredOrders++;

    // Monthly trend chart is always all-time (trailing 12 months), regardless of the period filter.
    const month = new Date(at).toISOString().slice(0, 7);
    const m = byMonth.get(month) ?? { revenue: 0, cogs: 0 };
    m.revenue += total;
    m.cogs += orderCogs;
    byMonth.set(month, m);

    if (inPeriod(at)) {
      revenue += total;
      cogs += orderCogs;
      deliveredOrders++;
    }
  }

  const atExpensesTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const expensesTotal = expenses.filter((e) => inPeriod(e.date)).reduce((s, e) => s + e.amount, 0);
  const expensesByMonth = new Map<string, number>();
  for (const e of expenses) {
    const month = e.date.slice(0, 7);
    expensesByMonth.set(month, (expensesByMonth.get(month) ?? 0) + e.amount);
  }

  const inventoryLines: InventoryLine[] = products
    .filter((p) => p.status !== "archived" && p.stock > 0)
    .map((p) => {
      const cp = costOf.get(p.id) ?? settings.defaultCostPrice;
      return { id: p.id, name: p.name, brand: p.brand, stock: p.stock, costPrice: cp, value: cp * p.stock };
    })
    .sort((a, b) => b.value - a.value);
  const inventoryValue = inventoryLines.reduce((s, l) => s + l.value, 0);
  const inventoryUnits = inventoryLines.reduce((s, l) => s + l.stock, 0);

  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expensesTotal;
  // Cash is always the all-time cumulative position — a snapshot of today, not an activity figure for the selected period.
  const cash = settings.startingCapital + atRevenue - atCogs - inventoryValue - atExpensesTotal;
  const atNetProfit = (atRevenue - atCogs) - atExpensesTotal;

  const monthly: MonthPoint[] = last12Months().map((month) => {
    const rev = byMonth.get(month)?.revenue ?? 0;
    const cg = byMonth.get(month)?.cogs ?? 0;
    const exp = expensesByMonth.get(month) ?? 0;
    return { month, revenue: rev, cogs: cg, grossProfit: rev - cg, expenses: exp, netProfit: rev - cg - exp };
  });

  const allTimeView = period === "all";

  return {
    configured: true,
    period,
    periodLabel: periodLabel(period),
    startingCapital: settings.startingCapital,
    defaultCostPrice: settings.defaultCostPrice,
    deliveredOrders,
    revenue,
    cogs,
    grossProfit,
    expensesTotal,
    netProfit,
    allTime: { revenue: atRevenue, cogs: atCogs, expensesTotal: atExpensesTotal, deliveredOrders: atDeliveredOrders },
    inventoryValue,
    inventoryUnits,
    inventoryLines,
    cash,
    monthly,
    balanceSheet: {
      assetsCash: cash,
      assetsInventory: inventoryValue,
      assetsTotal: cash + inventoryValue,
      liabilities: 0,
      equityStartingCapital: settings.startingCapital,
      equityRetainedEarnings: atNetProfit,
      equityTotal: settings.startingCapital + atNetProfit,
    },
    cashFlow: allTimeView
      ? {
          allTimeView: true,
          financing: settings.startingCapital,
          operatingRevenue: atRevenue,
          operatingCogs: -atCogs,
          operatingInventory: -inventoryValue,
          operatingExpenses: -atExpensesTotal,
          operatingNet: atRevenue - atCogs - inventoryValue - atExpensesTotal,
          net: cash,
        }
      : {
          allTimeView: false,
          financing: 0,
          operatingRevenue: revenue,
          operatingCogs: -cogs,
          operatingInventory: 0,
          operatingExpenses: -expensesTotal,
          operatingNet: revenue - cogs - expensesTotal,
          net: revenue - cogs - expensesTotal,
        },
  };
}
