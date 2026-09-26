import { Plus } from "lucide-react";
import Link from "next/link";
import { getAdminProductList } from "@/lib/productOverrides";
import { ProductsTable } from "./ProductsTable";

export const metadata = { title: "Admin — Products" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { configured, products } = await getAdminProductList();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted">Edit price, photos, name, specs, condition, description and stock for any listing — changes go live immediately.</p>
        </div>
        <Link href="/admin/products/new" className="flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg transition hover:opacity-90">
          <Plus className="size-4" aria-hidden /> Add new product
        </Link>
      </div>

      {!configured && (
        <div className="rounded-2xl border border-dashed border-line-strong bg-elev px-5 py-4 text-sm text-subtle">
          Connect your free database to save edits here — see <code className="rounded bg-soft px-1 py-0.5">ADMIN_SETUP.md</code>. You can still browse the catalogue below.
        </div>
      )}

      <ProductsTable products={products} />
    </div>
  );
}
