"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn, formatDate, formatPrice, ORDER_STEPS } from "@/lib/format";
import type { RecentOrder } from "@/lib/adminData";

const STAGES: { id: string; label: string }[] = [...ORDER_STEPS.map((s) => ({ id: s.id, label: s.label })), { id: "cancelled", label: "Cancelled" }];

const STATUS_STYLE: Record<string, string> = {
  placed: "bg-accent-soft text-accent",
  confirmed: "bg-accent-soft text-accent",
  packed: "bg-soft text-muted",
  shipped: "bg-soft text-muted",
  "out-for-delivery": "bg-soft text-muted",
  delivered: "bg-success-soft text-success",
  cancelled: "bg-danger-soft text-danger",
};

/** One flattened status-change event, across every order, for the activity feed. */
interface ActivityEvent { orderId: string; customerName: string; status: string; at: string }

/**
 * The admin Orders page's interactive table — stage counts you can click to
 * filter, a search box, and a recent-activity feed of status changes across
 * every order (the "audit log" of who moved to what stage, and when).
 * Everything filters client-side against the orders already fetched, so
 * clicking a stage or typing a search term is instant.
 */
export function OrdersTable({ orders }: { orders: RecentOrder[] }) {
  const [stage, setStage] = useState<string>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of orders) m.set(o.status, (m.get(o.status) ?? 0) + 1);
    return m;
  }, [orders]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (stage !== "all" && o.status !== stage) return false;
      if (!t) return true;
      return `${o.id} ${o.customerName}`.toLowerCase().includes(t);
    });
  }, [orders, stage, q]);

  const activity = useMemo(() => {
    const events: ActivityEvent[] = orders.flatMap((o) => o.statusHistory.map((e) => ({ orderId: o.id, customerName: o.customerName, status: e.status, at: e.at })));
    return events.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 20);
  }, [orders]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        <StagePill active={stage === "all"} label="All" count={orders.length} onClick={() => setStage("all")} />
        {STAGES.map((s) => (
          <StagePill key={s.id} active={stage === s.id} label={s.label} count={counts.get(s.id) ?? 0} onClick={() => setStage(s.id)} tone={s.id === "cancelled" ? "danger" : s.id === "delivered" ? "success" : "default"} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order number or customer…"
            className="w-full max-w-sm rounded-lg border border-line bg-elev px-3.5 py-2 text-sm outline-none focus:border-accent"
          />
          <p className="text-xs text-subtle">{filtered.length} of {orders.length} orders{stage !== "all" ? ` · ${STAGES.find((s) => s.id === stage)?.label ?? stage}` : ""}</p>

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong bg-elev px-6 py-14 text-center text-sm text-subtle">
              {orders.length === 0 ? "No orders yet — they'll show up here the moment someone checks out." : "No orders match this filter."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-line bg-elev">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-subtle">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Placed</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="cursor-pointer border-b border-line last:border-0 hover:bg-soft">
                      <td className="p-0"><Link href={`/admin/orders/${o.id}`} className="block px-4 py-3 font-mono text-xs font-semibold">{o.id}</Link></td>
                      <td className="p-0"><Link href={`/admin/orders/${o.id}`} className="block px-4 py-3">{o.customerName}</Link></td>
                      <td className="p-0"><Link href={`/admin/orders/${o.id}`} className="block px-4 py-3 text-muted">{formatDate(o.placedAt, true)}</Link></td>
                      <td className="p-0"><Link href={`/admin/orders/${o.id}`} className="block px-4 py-3 text-muted">{o.itemCount}</Link></td>
                      <td className="p-0"><Link href={`/admin/orders/${o.id}`} className="block px-4 py-3 text-muted capitalize">{o.paymentMethod}</Link></td>
                      <td className="p-0">
                        <Link href={`/admin/orders/${o.id}`} className="block px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[o.status] ?? "bg-soft text-muted"}`}>{o.status}</span>
                        </Link>
                      </td>
                      <td className="p-0"><Link href={`/admin/orders/${o.id}`} className="block px-4 py-3 text-right font-semibold tabular-nums">{formatPrice(o.total)}</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-line bg-elev p-5">
          <h2 className="mb-1 text-sm font-bold">Recent activity</h2>
          <p className="mb-4 text-xs text-subtle">Every status change, most recent first — your audit log of who moved to what stage, and when.</p>
          {activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-subtle">No status changes logged yet.</p>
          ) : (
            <ol className="space-y-3">
              {activity.map((e, i) => (
                <li key={i} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <Link href={`/admin/orders/${e.orderId}`} className="block truncate font-mono text-xs font-semibold hover:underline">{e.orderId}</Link>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                      <span className={cn("rounded-full px-1.5 py-0.5 font-semibold capitalize", STATUS_STYLE[e.status] ?? "bg-soft text-muted")}>{e.status}</span>
                      {e.customerName}
                    </p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-xs text-subtle">{formatDate(e.at, true)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

function StagePill({ label, count, active, onClick, tone = "default" }: { label: string; count: number; active: boolean; onClick: () => void; tone?: "default" | "success" | "danger" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
        active
          ? tone === "success" ? "bg-success text-white" : tone === "danger" ? "bg-danger text-white" : "bg-accent text-accent-fg"
          : "bg-soft text-muted hover:bg-line hover:text-fg"
      )}
    >
      {label}
      <span className={cn("rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums", active ? "bg-white/25" : "bg-line text-fg")}>{count}</span>
    </button>
  );
}
