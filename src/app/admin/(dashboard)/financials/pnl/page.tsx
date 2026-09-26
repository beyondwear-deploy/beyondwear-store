import { NotConfigured } from "@/components/admin/NotConfigured";
import { getFinancialSummary } from "@/lib/financials";
import { formatPrice } from "@/lib/format";
import { FinancialsNav } from "../FinancialsNav";

export const metadata = { title: "Admin — Profit & Loss" };
export const dynamic = "force-dynamic";

function monthLabel(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export default async function AdminPnlPage() {
  const f = await getFinancialSummary();
  const months = [...f.monthly].reverse(); // most recent first

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profit &amp; Loss</h1>
        <p className="text-sm text-muted">Revenue is attributed to the month an order was delivered; expenses to the month they were logged.</p>
      </div>

      <FinancialsNav />

      {!f.configured && <NotConfigured what="Profit & loss" />}

      {f.configured && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Revenue (all-time)" value={f.revenue} />
            <Stat label="COGS (all-time)" value={f.cogs} />
            <Stat label="Gross profit" value={f.grossProfit} />
            <Stat label="Net profit" value={f.netProfit} highlight />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-line bg-elev">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-subtle">
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">COGS</th>
                  <th className="px-4 py-3 text-right">Gross profit</th>
                  <th className="px-4 py-3 text-right">Expenses</th>
                  <th className="px-4 py-3 text-right">Net profit</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m) => (
                  <tr key={m.month} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-semibold">{monthLabel(m.month)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPrice(m.revenue)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{formatPrice(m.cogs)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{formatPrice(m.grossProfit)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{formatPrice(m.expenses)}</td>
                    <td className={`px-4 py-3 text-right tabular-nums font-bold ${m.netProfit >= 0 ? "text-success" : "text-danger"}`}>{formatPrice(m.netProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-elev p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</p>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${highlight ? (value >= 0 ? "text-success" : "text-danger") : ""}`}>{formatPrice(value)}</p>
    </div>
  );
}
