/**
 * ADMIN DASHBOARD DATA — server-only aggregation queries over Supabase.
 * Reads raw rows and aggregates in JS (this store's volume is small, so a
 * full client-side SQL/RPC layer isn't needed yet). Every function returns
 * `configured: false` gracefully when Supabase isn't connected yet, so the
 * dashboard can show a clear "connect your database" notice instead of
 * crashing.
 *
 * PERIOD FILTER — `getOrderStats` and `getTrafficStats` both accept a
 * Period (day/week/month/quarter/year/all — see @/lib/period). It scopes
 * every *activity* figure (revenue, delivered/placed orders, pageviews,
 * visitors, top lists) to that rolling window, and lengthens or shortens
 * the trend-chart window to match. A couple of figures stay fixed
 * on purpose because they're a snapshot, not a period activity: pending
 * revenue (today's backlog, whenever it was placed) and the rolling 7/30
 * day reference figures.
 */
import { getProductBySlug } from "@/lib/catalog";
import { getSupabaseAdmin } from "@/lib/supabase";
import { periodChartDays, periodStart, type Period } from "@/lib/period";
import type { Order } from "@/lib/types";

export interface DayPoint { date: string; value: number; secondary?: number }

const FALLBACK_CUSTOMER: Order["customer"] = { fullName: "—", phone: "—", email: "—" };
const FALLBACK_SHIPPING: Order["shipping"] = { fullName: "—", phone: "—", address: "—", city: "—", province: "—", postalCode: "—" };

/**
 * Maps a raw `orders` row (snake_case DB columns) to the app's `Order` shape.
 * Guards every nested/array field rather than trusting the DB row matches the
 * current shape exactly — a handful of very early test/legacy orders predate
 * later columns or field additions, and one broken order shouldn't crash the
 * order detail or tracking page for everyone else.
 */
function rowToOrder(o: Record<string, unknown>): Order {
  return {
    id: o.id as string,
    placedAt: o.placed_at as string,
    customer: (o.customer as Order["customer"] | null) ?? FALLBACK_CUSTOMER,
    shipping: (o.shipping as Order["shipping"] | null) ?? FALLBACK_SHIPPING,
    deliveryMethod: (o.delivery_method as string) ?? "—",
    paymentMethod: o.payment_method as Order["paymentMethod"],
    paymentStatus: o.payment_status as Order["paymentStatus"],
    items: Array.isArray(o.items) ? (o.items as Order["items"]) : [],
    subtotal: Number(o.subtotal) || 0,
    discount: Number(o.discount) || 0,
    deliveryFee: Number(o.delivery_fee) || 0,
    total: Number(o.total) || 0,
    promoCode: (o.promo_code as string) ?? undefined,
    dbStatus: o.status as Order["dbStatus"],
    statusHistory: Array.isArray(o.status_history) ? (o.status_history as Order["statusHistory"]) : [],
  };
}

/** One full order, for the admin order detail page and the customer tracking lookup. */
export async function getOrder(id: string): Promise<{ configured: boolean; order: Order | null }> {
  const db = getSupabaseAdmin();
  if (!db) return { configured: false, order: null };
  const { data, error } = await db.from("orders").select("*").eq("id", id).maybeSingle();
  if (error || !data) return { configured: true, order: null };
  return { configured: true, order: rowToOrder(data) };
}

export interface OrderStats {
  configured: boolean;
  totalOrders: number;
  /** Booked revenue within the selected period — only orders marked Delivered count, per the store's accounting. */
  totalRevenue: number;
  /** Value of currently-pending orders (placed but not yet delivered or cancelled) — a backlog snapshot, not scoped to the period. */
  pendingRevenue: number;
  /** Delivered orders within the selected period. */
  deliveredOrders: number;
  /** Orders placed within the selected period, any status — the "how many are actually ordering" half of the conversion rate. */
  ordersPlacedInPeriod: number;
  ordersToday: number;
  revenue7d: number;
  revenue30d: number;
  /** Average value per delivered order, within the selected period. */
  avgOrderValue: number;
  /** Status mix of orders placed within the selected period. */
  statusBreakdown: { status: string; count: number }[];
  revenueByDay: DayPoint[]; // trailing window sized to the period — value = revenue booked (by delivery date), secondary = orders delivered
  topProducts: { name: string; qty: number; revenue: number }[];
}

const EMPTY_ORDER_STATS: OrderStats = {
  configured: false, totalOrders: 0, totalRevenue: 0, pendingRevenue: 0, deliveredOrders: 0, ordersPlacedInPeriod: 0, ordersToday: 0, revenue7d: 0, revenue30d: 0,
  avgOrderValue: 0, statusBreakdown: [], revenueByDay: [], topProducts: [],
};

/** The date revenue for this order should be booked on — when it was marked Delivered, falling back to when it was placed if there's no history (legacy rows from before status tracking). */
function deliveredAt(o: { placed_at: string; status: string; status_history: unknown }): string | null {
  if (o.status !== "delivered") return null;
  const history = Array.isArray(o.status_history) ? (o.status_history as { status: string; at: string }[]) : [];
  return history.find((e) => e.status === "delivered")?.at ?? o.placed_at;
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export async function getOrderStats(period: Period = "all"): Promise<OrderStats> {
  const db = getSupabaseAdmin();
  if (!db) return EMPTY_ORDER_STATS;

  const { data, error } = await db
    .from("orders")
    .select("id, placed_at, total, status, status_history, items")
    .order("placed_at", { ascending: false })
    .limit(2000);
  if (error || !data) return { ...EMPTY_ORDER_STATS, configured: true };

  const now = new Date();
  const start = periodStart(period, now);
  const inPeriod = (iso: string) => !start || (new Date(iso).getTime() >= start.getTime() && new Date(iso).getTime() <= now.getTime());

  const DAY = 86400000;
  const todayStr = now.toISOString().slice(0, 10);
  let totalRevenue = 0, pendingRevenue = 0, revenue7d = 0, revenue30d = 0, ordersToday = 0, deliveredOrders = 0, ordersPlacedInPeriod = 0;
  const statusCounts = new Map<string, number>();
  const byDay = new Map<string, { revenue: number; count: number }>();
  const productTotals = new Map<string, { qty: number; revenue: number }>();

  for (const o of data) {
    const total = Number(o.total) || 0;
    if (new Date(o.placed_at).toISOString().slice(0, 10) === todayStr) ordersToday++;

    if (inPeriod(o.placed_at)) {
      ordersPlacedInPeriod++;
      statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
    }

    // Pending backlog is a current snapshot — every not-yet-delivered, not-cancelled
    // order counts, whenever it was placed, not just ones placed within the period.
    if (o.status !== "delivered" && o.status !== "cancelled") pendingRevenue += total;

    // Revenue books only once an order is Delivered — never at placement — per
    // the store's accounting. It's attributed to the day it was delivered.
    const at = deliveredAt(o);
    if (at) {
      const ageMs = now.getTime() - new Date(at).getTime();
      if (ageMs <= 7 * DAY) revenue7d += total;
      if (ageMs <= 30 * DAY) revenue30d += total;

      if (!inPeriod(at)) continue;

      deliveredOrders++;
      totalRevenue += total;
      const dayKey = new Date(at).toISOString().slice(0, 10);
      const existing = byDay.get(dayKey) ?? { revenue: 0, count: 0 };
      existing.revenue += total;
      existing.count += 1;
      byDay.set(dayKey, existing);

      const items = Array.isArray(o.items) ? (o.items as { name?: string; brand?: string; qty?: number; price?: number }[]) : [];
      for (const it of items) {
        const key = `${it.brand ?? ""} ${it.name ?? "Item"}`.trim();
        const p = productTotals.get(key) ?? { qty: 0, revenue: 0 };
        p.qty += it.qty ?? 0;
        p.revenue += (it.price ?? 0) * (it.qty ?? 0);
        productTotals.set(key, p);
      }
    }
  }

  const revenueByDay = lastNDays(periodChartDays(period)).map((date) => ({ date, value: byDay.get(date)?.revenue ?? 0, secondary: byDay.get(date)?.count ?? 0 }));
  const statusBreakdown = Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count }));
  const topProducts = Array.from(productTotals.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    configured: true,
    totalOrders: data.length,
    totalRevenue,
    pendingRevenue,
    deliveredOrders,
    ordersPlacedInPeriod,
    ordersToday,
    revenue7d,
    revenue30d,
    avgOrderValue: deliveredOrders ? Math.round(totalRevenue / deliveredOrders) : 0,
    statusBreakdown,
    revenueByDay,
    topProducts,
  };
}

export interface RecentOrder {
  id: string; placedAt: string; customerName: string; total: number; status: string; paymentMethod: string; itemCount: number;
}

export async function getRecentOrders(limit = 50): Promise<{ configured: boolean; orders: RecentOrder[] }> {
  const db = getSupabaseAdmin();
  if (!db) return { configured: false, orders: [] };
  const { data, error } = await db.from("orders").select("id, placed_at, customer, total, status, payment_method, items").order("placed_at", { ascending: false }).limit(limit);
  if (error || !data) return { configured: true, orders: [] };
  return {
    configured: true,
    orders: data.map((o) => ({
      id: o.id,
      placedAt: o.placed_at,
      customerName: (o.customer as { fullName?: string })?.fullName ?? "—",
      total: Number(o.total) || 0,
      status: o.status,
      paymentMethod: o.payment_method,
      itemCount: Array.isArray(o.items) ? o.items.length : 0,
    })),
  };
}

export interface TrafficStats {
  configured: boolean;
  totalViews: number;
  uniqueVisitors: number;
  viewsByDay: DayPoint[]; // trailing window sized to the period
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  deviceBreakdown: { device: string; views: number }[];
  /** Top 10 products by pageviews on their own product page — how many people looked, not how many bought (see topProducts in OrderStats for the revenue-based ranking). */
  topProductsByViews: { slug: string; brand: string; name: string; views: number }[];
}

const EMPTY_TRAFFIC: TrafficStats = { configured: false, totalViews: 0, uniqueVisitors: 0, viewsByDay: [], topPages: [], topReferrers: [], deviceBreakdown: [], topProductsByViews: [] };

export async function getTrafficStats(period: Period = "all"): Promise<TrafficStats> {
  const db = getSupabaseAdmin();
  if (!db) return EMPTY_TRAFFIC;

  const now = new Date();
  // "All time" still needs a lower bound for the query — cap it at a year back so it stays bounded and matches the trend chart's own cap.
  const since = periodStart(period, now) ?? new Date(now.getTime() - periodChartDays("all") * 86400000);
  const { data, error } = await db.from("page_views").select("path, referrer, device, visitor_id, created_at").gte("created_at", since.toISOString()).limit(20000);
  if (error || !data) return { ...EMPTY_TRAFFIC, configured: true };

  const byDay = new Map<string, number>();
  const pageCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const productViewCounts = new Map<string, number>();
  const visitors = new Set<string>();

  for (const v of data) {
    const dayKey = new Date(v.created_at).toISOString().slice(0, 10);
    byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + 1);
    pageCounts.set(v.path, (pageCounts.get(v.path) ?? 0) + 1);
    const ref = v.referrer ? safeHost(v.referrer) : "Direct";
    referrerCounts.set(ref, (referrerCounts.get(ref) ?? 0) + 1);
    deviceCounts.set(v.device ?? "unknown", (deviceCounts.get(v.device ?? "unknown") ?? 0) + 1);
    if (v.visitor_id) visitors.add(v.visitor_id);

    const slugMatch = /^\/product\/([^/?#]+)/.exec(v.path ?? "");
    if (slugMatch) productViewCounts.set(slugMatch[1], (productViewCounts.get(slugMatch[1]) ?? 0) + 1);
  }

  const topProductsByViews = Array.from(productViewCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([slug, views]) => {
      const p = getProductBySlug(slug);
      return { slug, brand: p?.brand ?? "", name: p?.name ?? slug, views };
    });

  return {
    configured: true,
    totalViews: data.length,
    uniqueVisitors: visitors.size,
    viewsByDay: lastNDays(periodChartDays(period)).map((date) => ({ date, value: byDay.get(date) ?? 0 })),
    topPages: Array.from(pageCounts.entries()).map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 8),
    topReferrers: Array.from(referrerCounts.entries()).map(([referrer, views]) => ({ referrer, views })).sort((a, b) => b.views - a.views).slice(0, 6),
    deviceBreakdown: Array.from(deviceCounts.entries()).map(([device, views]) => ({ device, views })).sort((a, b) => b.views - a.views),
    topProductsByViews,
  };
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}
