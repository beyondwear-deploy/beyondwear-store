import { NotConfigured } from "@/components/admin/NotConfigured";
import { getFinancialSummary } from "@/lib/financials";
import { formatPrice } from "@/lib/format";
import { FinancialsNav } from "../FinancialsNav";

export const metadata = { title: "Admin — Cash Flow" };
export const dynamic = "force-dynamic";

export default async function AdminCashFlowPage() {
  const f = await getFinancialSummary();
  const c = f.cashFlow;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cash Flow Statement</h1>
        <p className="text-sm text-muted">Where your cash came from, all-time (since starting capital was entered).</p>
      </div>

      <FinancialsNav />

      {!f.configured && <NotConfigured what="Cash flow" />}

      {f.configured && (
        <div className="mx-auto max-w-xl space-y-6">
          <div className="rounded-2xl border border-line bg-elev p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-subtle">Financing activities</h2>
            <Row label="Starting capital" value={c.financing} />
          </div>
          <div className="rounded-2xl border border-line bg-elev p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-subtle">Operating activities</h2>
            <Row label="Revenue (delivered orders)" value={c.operatingRevenue} />
            <Row label="Cost of goods sold" value={c.operatingCogs} />
            <Row label="Inventory on hand (at cost)" value={c.operatingInventory} />
            <Row label="Expenses" value={c.operatingExpenses} />
            <Row label="Net cash from operations" value={c.operatingNet} total />
          </div>
          <div className="rounded-2xl border border-line bg-accent-soft p-6">
            <Row label="Net cash position" value={c.net} total />
          </div>
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
