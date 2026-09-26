import { NotConfigured } from "@/components/admin/NotConfigured";
import { getFinancialSummary } from "@/lib/financials";
import { formatPrice } from "@/lib/format";
import { FinancialsNav } from "../FinancialsNav";

export const metadata = { title: "Admin — Balance Sheet" };
export const dynamic = "force-dynamic";

export default async function AdminBalanceSheetPage() {
  const f = await getFinancialSummary();
  const b = f.balanceSheet;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Balance Sheet</h1>
        <p className="text-sm text-muted">A snapshot of what the store owns and where its equity comes from, as of today.</p>
      </div>

      <FinancialsNav />

      {!f.configured && <NotConfigured what="Balance sheet" />}

      {f.configured && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-elev p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-subtle">Assets</h2>
            <Row label="Cash" value={b.assetsCash} />
            <Row label="Inventory (at cost)" value={b.assetsInventory} />
            <Row label="Total assets" value={b.assetsTotal} total />
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-elev p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-subtle">Liabilities</h2>
              <Row label="Total liabilities" value={b.liabilities} total />
              <p className="mt-2 text-xs text-subtle">Not tracked yet — no supplier credit or loans logged. Add expense entries as they're paid to keep this accurate.</p>
            </div>
            <div className="rounded-2xl border border-line bg-elev p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-subtle">Equity</h2>
              <Row label="Starting capital" value={b.equityStartingCapital} />
              <Row label="Retained earnings (net profit)" value={b.equityRetainedEarnings} />
              <Row label="Total equity" value={b.equityTotal} total />
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-dashed border-line-strong bg-elev p-5 text-center text-sm">
            <span className="font-semibold">Assets ({formatPrice(b.assetsTotal)})</span>
            <span className="mx-2 text-muted">=</span>
            <span className="font-semibold">Liabilities ({formatPrice(b.liabilities)})</span>
            <span className="mx-2 text-muted">+</span>
            <span className="font-semibold">Equity ({formatPrice(b.equityTotal)})</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, total }: { label: string; value: number; total?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 text-sm ${total ? "mt-2 border-t border-line pt-3 font-bold" : ""}`}>
      <span className={total ? "" : "text-muted"}>{label}</span>
      <span className="tabular-nums">{formatPrice(value)}</span>
    </div>
  );
}
