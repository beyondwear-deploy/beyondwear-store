import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getStoreSettings } from "@/lib/storeSettings";
import { NewProductForm } from "./NewProductForm";

export const metadata = { title: "Admin — Add new product" };
export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const { settings } = await getStoreSettings();
  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> All products
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Add new product</h1>
        <p className="text-sm text-muted">Fill in the details and upload at least one photo — it'll appear on the live site as soon as you save.</p>
      </div>
      <NewProductForm defaultCostPrice={settings.defaultCostPrice} />
    </div>
  );
}
