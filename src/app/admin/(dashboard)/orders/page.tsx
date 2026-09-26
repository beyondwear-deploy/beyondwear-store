import { NotConfigured } from "@/components/admin/NotConfigured";
import { getRecentOrders } from "@/lib/adminData";
import { OrdersTable } from "./OrdersTable";

export const metadata = { title: "Admin — Orders" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  // 500 covers every order for a store this size, so the stage counts and
  // activity feed below are exact, not just a "most recent" sample.
  const { configured, orders } = await getRecentOrders(500);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted">Real orders placed on the site. Click a stage below to filter, or click any order to update its status.</p>
      </div>

      {!configured && <NotConfigured what="Order tracking" />}

      {configured && <OrdersTable orders={orders} />}
    </div>
  );
}
