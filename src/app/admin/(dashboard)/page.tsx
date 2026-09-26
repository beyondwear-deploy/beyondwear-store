import { BadgeCheck, Clock, Eye, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { BreakdownBars } from "@/components/admin/BreakdownBars";
import { KpiCard } from "@/components/admin/KpiCard";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { TrendChart } from "@/components/admin/charts/TrendChart";
import { getOrderStats, getTrafficStats } from "@/lib/adminData";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Admin — Overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [orders, traffic] = await Promise.all([getOrderStats(), getTrafficStats()]);
  const configured = orders.configured && traffic.configured;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted">Your business and traffic, at a glance — like a YouTube Studio for the shop.</p>
      </div>

      {!configured && <NotConfigured what="Your dashboard" />}

      {configured && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <KpiCard label="Revenue (booked)" value={formatPrice(orders.totalRevenue)} icon={TrendingUp} hint={`${orders.deliveredOrders} delivered orders`} />
            <KpiCard label="Pending revenue" value={formatPrice(orders.pendingRevenue)} icon={Clock} hint="Placed, not yet delivered" />
            <KpiCard label="Revenue (7 days)" value={formatPrice(orders.revenue7d)} icon={BadgeCheck} hint={`${formatPrice(orders.revenue30d)} in 30 days`} />
            <KpiCard label="Avg. order value" value={formatPrice(orders.avgOrderValue)} icon={ShoppingBag} hint={`${orders.ordersToday} orders today`} />
            <KpiCard label="Unique visitors" value={traffic.uniqueVisitors.toLocaleString()} icon={Users} hint={`${traffic.totalViews.toLocaleString()} pageviews · 14 days`} />
          </div>
          <p className="-mt-4 text-xs text-subtle">Revenue is booked when an order is marked <strong className="font-semibold text-fg">Delivered</strong> — not when it's placed. Update statuses from <Link href="/admin/orders" className="underline">Orders</Link>.</p>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-1 text-sm font-bold">Revenue — last 14 days</h2>
              <p className="mb-2 text-xs text-subtle">Rs booked per day, by delivery date</p>
              <TrendChart data={orders.revenueByDay} valuePrefix="Rs " />
            </div>
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-1 text-sm font-bold">Traffic — last 14 days</h2>
              <p className="mb-2 text-xs text-subtle">Pageviews per day</p>
              <TrendChart data={traffic.viewsByDay} color="#3b82f6" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-4 flex items-center gap-1.5 text-sm font-bold"><Package className="size-4 text-accent" aria-hidden />Top products</h2>
              <BreakdownBars items={orders.topProducts.map((p) => ({ label: `${p.name} (×${p.qty})`, value: p.revenue }))} valueFormat={(n) => formatPrice(n)} />
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
