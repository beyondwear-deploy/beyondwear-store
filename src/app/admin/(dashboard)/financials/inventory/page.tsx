import Link from "next/link";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { PeriodSelect } from "@/components/admin/PeriodSelect";
import { getFinancialSummary } from "@/lib/financials";
import { formatPrice } from "@/lib/format";
import { parsePeriod } from "@/lib/period";
import { FinancialsNav } from "../FinancialsNav";

export const metadata = { title: "Admin — Inventory" };
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const period = parsePeriod((await searchParams).period);
  const f = await getFinancialSummary(period);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted">Every active or draft listing with stock on hand, valued at cost price — always current stock, as of today, whatever period you pick.</p>
        </div>
        <PeriodSelect value={period} />
      </div>

      <FinancialsNav />

      {!f.configured && <NotConfigured what="Inventory" />}

      {f.configured && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-elev p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Total units</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{f.inventoryUnits}</p>
            </div>
            <div className="rounded-2xl border border-line bg-elev p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Total value (at cost)</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{formatPrice(f.inventoryValue)}</p>
            </div>
          </div>

          {f.inventoryLines.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong bg-elev px-6 py-14 text-center text-sm text-subtle">No stock on hand right now.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-line bg-elev">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-subtle">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-right">Cost price</th>
                    <th className="px-4 py-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {f.inventoryLines.map((l) => (
                    <tr key={l.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3"><Link href={`/admin/products/${l.id}`} className="font-medium hover:underline">{l.brand} {l.name}</Link></td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted">{l.stock}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted">{formatPrice(l.costPrice)}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatPrice(l.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
