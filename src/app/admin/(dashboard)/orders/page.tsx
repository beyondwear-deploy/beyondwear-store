import Link from "next/link";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { getRecentOrders } from "@/lib/adminData";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Admin — Orders" };
export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  placed: "bg-accent-soft text-accent",
  confirmed: "bg-accent-soft text-accent",
  packed: "bg-soft text-muted",
  shipped: "bg-soft text-muted",
  "out-for-delivery": "bg-soft text-muted",
  delivered: "bg-success-soft text-success",
  cancelled: "bg-danger-soft text-danger",
};

export default async function AdminOrdersPage() {
  const { configured, orders } = await getRecentOrders(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted">Real orders placed on the site, most recent first. Click one to update its status.</p>
      </div>

      {!configured && <NotConfigured what="Order tracking" />}

      {configured && (
        orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong bg-elev px-6 py-14 text-center text-sm text-subtle">No orders yet — they&apos;ll show up here the moment someone checks out.</p>
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
                {orders.map((o) => (
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
        )
      )}
    </div>
  );
}
