import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { OrderDetails, paymentLabel, paymentStatusLabel } from "@/components/orders/OrderDetails";
import { getOrder } from "@/lib/adminData";
import { formatDate } from "@/lib/format";
import { StatusEditor } from "./StatusEditor";

export const metadata = { title: "Admin — Order" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { configured, order } = await getOrder(id);

  if (!configured) {
    return (
      <div className="space-y-6">
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft className="size-4" aria-hidden /> Orders</Link>
        <NotConfigured what="Order tracking" />
      </div>
    );
  }
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft className="size-4" aria-hidden /> Orders</Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-mono text-2xl font-bold">{order.id}</h1>
            <p className="text-sm text-muted">Placed {formatDate(order.placedAt, true)} by {order.customer.fullName} · {order.customer.email} · {order.customer.phone}</p>
          </div>
          <div className="text-right text-sm text-muted">
            <p className="font-semibold text-fg">{paymentLabel(order.paymentMethod)}</p>
            <p>{paymentStatusLabel(order.paymentStatus)}</p>
          </div>
        </div>
      </div>

      <StatusEditor orderId={order.id} status={order.dbStatus ?? "placed"} history={order.statusHistory ?? []} />

      <div className="rounded-2xl border border-line bg-elev p-5 sm:p-6">
        <OrderDetails order={order} />
      </div>
    </div>
  );
}
