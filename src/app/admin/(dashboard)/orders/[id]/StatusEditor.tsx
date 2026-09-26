"use client";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate, ORDER_STEPS } from "@/lib/format";
import type { FullOrderStatus, OrderStatusEvent } from "@/lib/types";

const OPTIONS: { id: FullOrderStatus; label: string }[] = [...ORDER_STEPS.map((s) => ({ id: s.id as FullOrderStatus, label: s.label })), { id: "cancelled", label: "Cancelled" }];

/**
 * Lets the admin move an order through its real lifecycle (pending
 * confirmation → … → delivered, or cancelled). Every change is timestamped
 * server-side and shown on both this page and the customer's tracking page.
 * Marking an order "Delivered" is also what makes its total count toward
 * revenue in the analytics/financials — see getOrderStats().
 */
export function StatusEditor({ orderId, status, history }: { orderId: string; status: FullOrderStatus; history: OrderStatusEvent[] }) {
  const router = useRouter();
  const [value, setValue] = useState<FullOrderStatus>(status);
  const [current, setCurrent] = useState(status);
  const [hist, setHist] = useState(history);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const update = async () => {
    if (value === current) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Update failed.");
      setCurrent(value);
      setHist(data.statusHistory ?? hist);
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
      setValue(current);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-elev p-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-subtle">Order status</span>
          <select value={value} onChange={(e) => { setValue(e.target.value as FullOrderStatus); setSaved(false); }} className="w-56 rounded-lg border border-line bg-elev px-3.5 py-2 text-sm outline-none focus:border-accent">
            {OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>
        <button
          type="button" onClick={update} disabled={saving || value === current}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {saving ? "Updating…" : "Update status"}
        </button>
        {saved && <span className="text-sm font-medium text-success">Updated.</span>}
      </div>
      {current === "delivered" && <p className="text-xs text-subtle">This order&apos;s total counts toward revenue.</p>}
      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      {hist.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-subtle">History</h3>
          <ol className="space-y-1.5 text-sm">
            {hist.map((e, i) => (
              <li key={i} className="flex items-center justify-between gap-4 rounded-lg bg-soft px-3 py-2">
                <span className="font-medium capitalize">{OPTIONS.find((o) => o.id === e.status)?.label ?? e.status}</span>
                <span className="text-xs text-muted">{formatDate(e.at, true)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
