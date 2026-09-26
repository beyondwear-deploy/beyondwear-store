import { Banknote, PackageSearch, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { KpiCard } from "@/components/admin/KpiCard";
import { PeriodSelect } from "@/components/admin/PeriodSelect";
import { getFinancialSummary } from "@/lib/financials";
import { formatPrice } from "@/lib/format";
import { parsePeriod } from "@/lib/period";
import { FinancialsNav } from "./FinancialsNav";

export const metadata = { title: "Admin — Financials" };
export const dynamic = "force-dynamic";

export default async function AdminFinancialsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const period = parsePeriod((await searchParams).period);
  const f = await getFinancialSummary(period);
  const isAll = f.period === "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financials</h1>
          <p className="text-sm text-muted">Total revenue, cost, profit &amp; loss, balance sheet, cash flow and inventory — computed live from your orders, costs and expenses.</p>
        </div>
        <PeriodSelect value={period} />
      </div>

      <FinancialsNav />

      {!f.configured && <NotConfigured what="Financials" />}

      {f.configured && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Revenue (delivered)" value={formatPrice(f.revenue)} icon={TrendingUp} hint={`${f.deliveredOrders} delivered orders · ${f.periodLabel}`} />
            <KpiCard label="Cost of goods sold" value={formatPrice(f.cogs)} icon={TrendingDown} hint={`At cost, delivered items · ${f.periodLabel}`} />
            <KpiCard label="Gross profit" value={formatPrice(f.grossProfit)} icon={Banknote} hint="Revenue − COGS" />
            <KpiCard label="Expenses" value={formatPrice(f.expensesTotal)} icon={Receipt} hint={`From your expense log · ${f.periodLabel}`} />
            <KpiCard label="Net profit" value={formatPrice(f.netProfit)} icon={f.netProfit >= 0 ? TrendingUp : TrendingDown} hint="Gross profit − expenses" />
            <KpiCard label="Inventory on hand" value={formatPrice(f.inventoryValue)} icon={PackageSearch} hint={`${f.inventoryUnits} units, at cost · as of today`} />
            <KpiCard label="Cash position" value={formatPrice(f.cash)} icon={Wallet} hint="Starting capital + revenue − cost − expenses, all-time" />
          </div>

          <div className="rounded-2xl border border-dashed border-line-strong bg-elev p-5 text-xs leading-relaxed text-subtle">
            <p className="font-semibold text-fg">How these numbers work</p>
            <p className="mt-1.5">Revenue only counts an order once it&apos;s marked <strong className="text-fg">Delivered</strong> in Orders — placing an order doesn&apos;t book revenue. Cost of goods sold uses each product&apos;s cost price (or the store default of {formatPrice(f.defaultCostPrice)} if unset — see Settings). The period dropdown scopes revenue, COGS, gross/net profit and expenses to {isAll ? "all time" : `this ${f.periodLabel.toLowerCase()}`}; inventory and cash position are always as of today, since they&apos;re a snapshot, not an activity figure. Liabilities aren&apos;t tracked yet (no supplier credit or loans logged), so the balance sheet treats them as zero.</p>
          </div>
        </>
      )}
    </div>
  );
}
