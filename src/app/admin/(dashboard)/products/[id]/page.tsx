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
  const { configured, product, hasOverride, isCustom } = await getAdminProduct(id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> All products
      </Link>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{product.brand} {product.name}</h1>
        {isCustom && <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">Added by you</span>}
      </div>
      <p className="-mt-4 text-sm text-muted">{product.sku} · size {product.size} · {product.color}</p>
      <ProductEditForm product={product} configured={configured} hasOverride={hasOverride} isCustom={isCustom} />
    </div>
  );
}
