import { NotConfigured } from "@/components/admin/NotConfigured";
import { PeriodSelect } from "@/components/admin/PeriodSelect";
import { getFinancialSummary } from "@/lib/financials";
import { formatPrice } from "@/lib/format";
import { parsePeriod } from "@/lib/period";
import { FinancialsNav } from "../FinancialsNav";

export const metadata = { title: "Admin — Cash Flow" };
export const dynamic = "force-dynamic";

export default async function AdminCashFlowPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const period = parsePeriod((await searchParams).period);
  const f = await getFinancialSummary(period);
  const c = f.cashFlow;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cash Flow Statement</h1>
          <p className="text-sm text-muted">{c.allTimeView ? "Where your cash came from, all-time (since starting capital was entered)." : `Cash generated from operations this ${f.periodLabel.toLowerCase()}.`}</p>
        </div>
        <PeriodSelect value={period} />
      </div>

      <FinancialsNav />

      {!f.configured && <NotConfigured what="Cash flow" />}

      {f.configured && (
        <div className="mx-auto max-w-xl space-y-6">
          {c.allTimeView && (
            <div className="rounded-2xl border border-line bg-elev p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-subtle">Financing activities</h2>
              <Row label="Starting capital" value={c.financing} />
            </div>
          )}
          <div className="rounded-2xl border border-line bg-elev p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-subtle">Operating activities</h2>
            <Row label="Revenue (delivered orders)" value={c.operatingRevenue} />
            <Row label="Cost of goods sold" value={c.operatingCogs} />
            {c.allTimeView && <Row label="Inventory on hand (at cost)" value={c.operatingInventory} />}
            <Row label="Expenses" value={c.operatingExpenses} />
            <Row label="Net cash from operations" value={c.operatingNet} total />
          </div>
          <div className="rounded-2xl border border-line bg-accent-soft p-6">
            <Row label={c.allTimeView ? "Net cash position" : "Net cash generated"} value={c.net} total />
          </div>
          {!c.allTimeView && (
            <p className="text-xs text-subtle">This period view shows operating cash movement only. Switch to <strong className="text-fg">All time</strong> to see financing (starting capital) and the current inventory-on-hand deduction, which together reconcile to your actual cash position.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, total }: { label: string; value: number; total?: boolean }) {
  const sign = value < 0 ? "− " : "";
  return (
    <div className={`flex items-center justify-between py-2 text-sm ${total ? "mt-2 border-t border-line pt-3 font-bold" : ""}`}>
      <span className={total ? "" : "text-muted"}>{label}</span>
      <span className="tabular-nums">{sign}{formatPrice(Math.abs(value))}</span>
    </div>
  );
}
