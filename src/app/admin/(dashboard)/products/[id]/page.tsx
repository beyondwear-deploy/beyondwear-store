import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminProduct } from "@/lib/productOverrides";
import { ProductEditForm } from "./ProductEditForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Admin — Edit ${id}` };
}

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { configured, product, hasOverride } = await getAdminProduct(id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> All products
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{product.brand} {product.name}</h1>
        <p className="text-sm text-muted">{product.sku} · size {product.size} · {product.color}</p>
      </div>
      <ProductEditForm product={product} configured={configured} hasOverride={hasOverride} />
    </div>
  );
}
