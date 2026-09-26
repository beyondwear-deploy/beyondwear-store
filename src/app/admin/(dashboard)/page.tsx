import { BadgeCheck, Clock, Eye, MousePointerClick, Package, Percent, ShoppingBag, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { BreakdownBars } from "@/components/admin/BreakdownBars";
import { KpiCard } from "@/components/admin/KpiCard";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { PeriodSelect } from "@/components/admin/PeriodSelect";
import { TrendChart } from "@/components/admin/charts/TrendChart";
import { getOrderStats, getTrafficStats } from "@/lib/adminData";
import { formatPrice } from "@/lib/format";
import { parsePeriod, periodLabel, type Period } from "@/lib/period";

export const metadata = { title: "Admin — Overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const raw = (await searchParams).period;
  // Defaults to "Month" here (rather than "All time") to match this dashboard's old fixed
  // recent-activity feel — Financials defaults to all-time since it's a cumulative report.
  const period: Period = raw ? parsePeriod(raw) : "month";
  const [orders, traffic] = await Promise.all([getOrderStats(period), getTrafficStats(period)]);
  const configured = orders.configured && traffic.configured;
  const conversionRate = traffic.uniqueVisitors ? (orders.ordersPlacedInPeriod / traffic.uniqueVisitors) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-sm text-muted">Your business and traffic, at a glance — like a YouTube Studio for the shop.</p>
        </div>
        <PeriodSelect value={period} />
      </div>

      {!configured && <NotConfigured what="Your dashboard" />}

      {configured && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Revenue (booked)" value={formatPrice(orders.totalRevenue)} icon={TrendingUp} hint={`${orders.deliveredOrders} delivered · ${periodLabel(period)}`} />
            <KpiCard label="Pending revenue" value={formatPrice(orders.pendingRevenue)} icon={Clock} hint="Placed, not yet delivered — current" />
            <KpiCard label="Revenue (7 days)" value={formatPrice(orders.revenue7d)} icon={BadgeCheck} hint={`${formatPrice(orders.revenue30d)} in 30 days`} />
            <KpiCard label="Avg. order value" value={formatPrice(orders.avgOrderValue)} icon={ShoppingBag} hint={`${orders.ordersToday} orders today`} />
            <KpiCard label="Unique visitors" value={traffic.uniqueVisitors.toLocaleString()} icon={Users} hint={`${traffic.totalViews.toLocaleString()} pageviews · ${periodLabel(period)}`} />
            <KpiCard label="Conversion rate" value={`${conversionRate.toFixed(1)}%`} icon={Percent} hint={`${orders.ordersPlacedInPeriod} orders / ${traffic.uniqueVisitors} visitors`} />
          </div>
          <p className="-mt-4 text-xs text-subtle">Revenue is booked when an order is marked <strong className="font-semibold text-fg">Delivered</strong> — not when it's placed. Conversion rate compares orders placed to unique visitors, both within the selected period. Update statuses from <Link href="/admin/orders" className="underline">Orders</Link>.</p>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-1 text-sm font-bold">Revenue — {periodLabel(period).toLowerCase()}</h2>
              <p className="mb-2 text-xs text-subtle">Rs booked per day, by delivery date</p>
              <TrendChart data={orders.revenueByDay} valuePrefix="Rs " />
            </div>
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-1 text-sm font-bold">Traffic — {periodLabel(period).toLowerCase()}</h2>
              <p className="mb-2 text-xs text-subtle">Pageviews per day</p>
              <TrendChart data={traffic.viewsByDay} color="#3b82f6" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-4 flex items-center gap-1.5 text-sm font-bold"><Package className="size-4 text-accent" aria-hidden />Top products (revenue)</h2>
              <BreakdownBars items={orders.topProducts.map((p) => ({ label: `${p.name} (×${p.qty})`, value: p.revenue }))} valueFormat={(n) => formatPrice(n)} />
            </div>
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-4 flex items-center gap-1.5 text-sm font-bold"><MousePointerClick className="size-4 text-accent" aria-hidden />Top products (clicks)</h2>
              <BreakdownBars items={traffic.topProductsByViews.map((p) => ({ label: `${p.brand} ${p.name}`.trim(), value: p.views }))} />
            </div>
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-4 flex items-center gap-1.5 text-sm font-bold"><Eye className="size-4 text-accent" aria-hidden />Top pages</h2>
              <BreakdownBars items={traffic.topPages.map((p) => ({ label: p.path, value: p.views }))} />
            </div>
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-4 text-sm font-bold">Order status</h2>
              <BreakdownBars items={orders.statusBreakdown.map((s) => ({ label: s.status, value: s.count }))} />
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/admin/orders" className="text-sm font-semibold text-accent hover:underline">View all orders →</Link>
          </div>
        </>
      )}
    </div>
  );
}
