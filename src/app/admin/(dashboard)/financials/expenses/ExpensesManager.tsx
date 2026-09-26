"use client";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate, formatPrice } from "@/lib/format";
import { EXPENSE_CATEGORIES, type Expense } from "@/lib/financials";

const todayStr = () => new Date().toISOString().slice(0, 10);

export function ExpensesManager({ expenses, total }: { expenses: Expense[]; total: number }) {
  const router = useRouter();
  const [date, setDate] = useState(todayStr());
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const add = async () => {
    setError("");
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 0) { setError("Enter a valid amount."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, category, amount: amt, note: note.trim() || null }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Couldn't add that expense.");
      setAmount("");
      setNote("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add that expense.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this expense? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Delete failed.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-elev p-5">
        <h2 className="mb-4 text-sm font-bold">Log an expense</h2>
        <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto_1fr_auto]">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (PKR)" className={`${inputCls} sm:w-36`} />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className={inputCls} />
          <button
            type="button" onClick={add} disabled={saving || !amount}
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Plus className="size-4" aria-hidden />}
            Add
          </button>
        </div>
        {error && <p className="mt-2 text-sm font-medium text-danger">{error}</p>}
      </div>

      {expenses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-elev px-6 py-14 text-center text-sm text-subtle">No expenses logged yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-elev">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-subtle">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-muted">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 font-medium">{e.category}</td>
                  <td className="px-4 py-3 text-muted">{e.note || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatPrice(e.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => remove(e.id)} disabled={deletingId === e.id} aria-label="Delete expense" className="rounded-lg p-1.5 text-subtle hover:bg-danger-soft hover:text-danger disabled:opacity-50">
                      {deletingId === e.id ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-subtle">Total</td>
                <td className="px-4 py-3 text-right font-bold tabular-nums">{formatPrice(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-line bg-elev px-3.5 py-2 text-sm outline-none focus:border-accent";
