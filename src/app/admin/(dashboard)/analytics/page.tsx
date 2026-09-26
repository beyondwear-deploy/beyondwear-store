import { Globe, Laptop, MousePointerClick, Smartphone, Tablet } from "lucide-react";
import { BreakdownBars } from "@/components/admin/BreakdownBars";
import { KpiCard } from "@/components/admin/KpiCard";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { PeriodSelect } from "@/components/admin/PeriodSelect";
import { TrendChart } from "@/components/admin/charts/TrendChart";
import { getTrafficStats } from "@/lib/adminData";
import { parsePeriod, periodLabel, type Period } from "@/lib/period";

export const metadata = { title: "Admin — Traffic" };
export const dynamic = "force-dynamic";

const DEVICE_ICON: Record<string, typeof Smartphone> = { mobile: Smartphone, desktop: Laptop, tablet: Tablet };

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const raw = (await searchParams).period;
  // Defaults to "Month" (rather than "All time") to match this page's old fixed recent-activity feel.
  const period: Period = raw ? parsePeriod(raw) : "month";
  const traffic = await getTrafficStats(period);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Traffic analytics</h1>
          <p className="text-sm text-muted">Where your visitors come from and what they look at — {periodLabel(period).toLowerCase()}.</p>
        </div>
        <PeriodSelect value={period} />
      </div>

      {!traffic.configured && <NotConfigured what="Traffic analytics" />}

      {traffic.configured && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <KpiCard label="Pageviews" value={traffic.totalViews.toLocaleString()} icon={Globe} hint={periodLabel(period)} />
            <KpiCard label="Unique visitors" value={traffic.uniqueVisitors.toLocaleString()} icon={Smartphone} hint="Anonymous, cookie-based" />
            <KpiCard
              label="Top device"
              value={traffic.deviceBreakdown[0]?.device ?? "—"}
              icon={DEVICE_ICON[traffic.deviceBreakdown[0]?.device ?? ""] ?? Laptop}
              hint={traffic.deviceBreakdown[0] ? `${traffic.deviceBreakdown[0].views.toLocaleString()} views` : undefined}
            />
          </div>

          <div className="rounded-2xl border border-line bg-elev p-5">
            <h2 className="mb-1 text-sm font-bold">Pageviews over time</h2>
            <p className="mb-2 text-xs text-subtle">Per day</p>
            <TrendChart data={traffic.viewsByDay} color="#3b82f6" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-4 flex items-center gap-1.5 text-sm font-bold"><MousePointerClick className="size-4 text-accent" aria-hidden />Top 10 clicked products</h2>
              <BreakdownBars items={traffic.topProductsByViews.map((p) => ({ label: `${p.brand} ${p.name}`.trim(), value: p.views }))} />
            </div>
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-4 text-sm font-bold">Top pages</h2>
              <BreakdownBars items={traffic.topPages.map((p) => ({ label: p.path, value: p.views }))} />
            </div>
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-4 text-sm font-bold">Top referrers</h2>
              <BreakdownBars items={traffic.topReferrers.map((r) => ({ label: r.referrer, value: r.views }))} />
            </div>
            <div className="rounded-2xl border border-line bg-elev p-5">
              <h2 className="mb-4 text-sm font-bold">Devices</h2>
              <BreakdownBars items={traffic.deviceBreakdown.map((d) => ({ label: d.device, value: d.views }))} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
