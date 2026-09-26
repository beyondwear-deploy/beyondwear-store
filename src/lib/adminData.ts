/**
 * ADMIN DASHBOARD DATA — server-only aggregation queries over Supabase.
 * Reads raw rows and aggregates in JS (this store's volume is small, so a
 * full client-side SQL/RPC layer isn't needed yet). Every function returns
 * `configured: false` gracefully when Supabase isn't connected yet, so the
 * dashboard can show a clear "connect your database" notice instead of
 * crashing.
 */
import { getSupabaseAdmin } from "@/lib/supabase";

export interface DayPoint { date: string; value: number; secondary?: number }

export interface OrderStats {
  configured: boolean;
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  revenue7d: number;
  revenue30d: number;
  avgOrderValue: number;
  statusBreakdown: { status: string; count: number }[];
  revenueByDay: DayPoint[]; // last 14 days — value = revenue, secondary = order count
  topProducts: { name: string; qty: number; revenue: number }[];
}

const EMPTY_ORDER_STATS: OrderStats = {
  configured: false, totalOrders: 0, totalRevenue: 0, ordersToday: 0, revenue7d: 0, revenue30d: 0,
  avgOrderValue: 0, statusBreakdown: [], revenueByDay: [], topProducts: [],
};

function last14Days(): string[] {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export async function getOrderStats(): Promise<OrderStats> {
  const db = getSupabaseAdmin();
  if (!db) return EMPTY_ORDER_STATS;

  const { data, error } = await db
    .from("orders")
    .select("id, placed_at, total, status, items")
    .order("placed_at", { ascending: false })
    .limit(2000);
  if (error || !data) return { ...EMPTY_ORDER_STATS, configured: true };

  const now = Date.now();
  const DAY = 86400000;
  const todayStr = new Date().toISOString().slice(0, 10);
  let totalRevenue = 0, revenue7d = 0, revenue30d = 0, ordersToday = 0;
  const statusCounts = new Map<string, number>();
  const byDay = new Map<string, { revenue: number; count: number }>();
  const productTotals = new Map<string, { qty: number; revenue: number }>();

  for (const o of data) {
    const total = Number(o.total) || 0;
    const placed = new Date(o.placed_at).getTime();
    const ageMs = now - placed;
    totalRevenue += total;
    if (ageMs <= 7 * DAY) revenue7d += total;
    if (ageMs <= 30 * DAY) revenue30d += total;
    if (new Date(o.placed_at).toISOString().slice(0, 10) === todayStr) ordersToday++;
    statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);

    const dayKey = new Date(o.placed_at).toISOString().slice(0, 10);
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

  const revenueByDay = last14Days().map((date) => ({ date, value: byDay.get(date)?.revenue ?? 0, secondary: byDay.get(date)?.count ?? 0 }));
  const statusBreakdown = Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count }));
  const topProducts = Array.from(productTotals.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    configured: true,
    totalOrders: data.length,
    totalRevenue,
    ordersToday,
    revenue7d,
    revenue30d,
    avgOrderValue: data.length ? Math.round(totalRevenue / data.length) : 0,
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
  viewsByDay: DayPoint[]; // last 14 days
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  deviceBreakdown: { device: string; views: number }[];
}

const EMPTY_TRAFFIC: TrafficStats = { configured: false, totalViews: 0, uniqueVisitors: 0, viewsByDay: [], topPages: [], topReferrers: [], deviceBreakdown: [] };

export async function getTrafficStats(): Promise<TrafficStats> {
  const db = getSupabaseAdmin();
  if (!db) return EMPTY_TRAFFIC;

  const since = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data, error } = await db.from("page_views").select("path, referrer, device, visitor_id, created_at").gte("created_at", since).limit(20000);
  if (error || !data) return { ...EMPTY_TRAFFIC, configured: true };

  const byDay = new Map<string, number>();
  const pageCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const visitors = new Set<string>();

  for (const v of data) {
    const dayKey = new Date(v.created_at).toISOString().slice(0, 10);
    byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + 1);
    pageCounts.set(v.path, (pageCounts.get(v.path) ?? 0) + 1);
    const ref = v.referrer ? safeHost(v.referrer) : "Direct";
    referrerCounts.set(ref, (referrerCounts.get(ref) ?? 0) + 1);
    deviceCounts.set(v.device ?? "unknown", (deviceCounts.get(v.device ?? "unknown") ?? 0) + 1);
    if (v.visitor_id) visitors.add(v.visitor_id);
  }

  return {
    configured: true,
    totalViews: data.length,
    uniqueVisitors: visitors.size,
    viewsByDay: last14Days().map((date) => ({ date, value: byDay.get(date) ?? 0 })),
    topPages: Array.from(pageCounts.entries()).map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 8),
    topReferrers: Array.from(referrerCounts.entries()).map(([referrer, views]) => ({ referrer, views })).sort((a, b) => b.views - a.views).slice(0, 6),
    deviceBreakdown: Array.from(deviceCounts.entries()).map(([device, views]) => ({ device, views })).sort((a, b) => b.views - a.views),
  };
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}
