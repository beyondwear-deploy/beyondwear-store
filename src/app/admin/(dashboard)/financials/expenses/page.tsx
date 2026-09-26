import { NotConfigured } from "@/components/admin/NotConfigured";
import { getExpenses } from "@/lib/financials";
import { FinancialsNav } from "../FinancialsNav";
import { ExpensesManager } from "./ExpensesManager";

export const metadata = { title: "Admin — Expenses" };
export const dynamic = "force-dynamic";

export default async function AdminExpensesPage() {
  const { configured, expenses } = await getExpenses();
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Expenses</h1>
        <p className="text-sm text-muted">Rent, packaging, ads, shipping paid out of pocket — every line here feeds straight into the P&amp;L and cash flow.</p>
      </div>

      <FinancialsNav />

      {!configured && <NotConfigured what="Expenses" />}
      {configured && <ExpensesManager expenses={expenses} total={total} />}
    </div>
  );
}
