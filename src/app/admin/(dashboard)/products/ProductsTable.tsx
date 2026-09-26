"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { categoryLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

const STATUS_STYLE: Record<Product["status"], string> = {
  active: "bg-success-soft text-success",
  draft: "bg-soft text-muted",
  archived: "bg-danger-soft text-danger",
};

export function ProductsTable({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return products;
    return products.filter((p) => `${p.brand} ${p.name} ${p.sku} ${p.id}`.toLowerCase().includes(t));
  }, [q, products]);

  return (
    <div className="space-y-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, brand or SKU…"
        className="w-full max-w-sm rounded-lg border border-line bg-elev px-3.5 py-2 text-sm outline-none focus:border-accent"
      />
      <p className="text-xs text-subtle">{filtered.length} of {products.length} products</p>
      <div className="overflow-x-auto rounded-2xl border border-line bg-elev">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-subtle">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-soft">
                      <ProductImage product={p} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-fg">{p.brand} {p.name}</p>
                      <p className="truncate text-xs text-subtle">{p.size} · {p.color} · {p.condition}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{categoryLabel(p.category)}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">{p.stock}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="rounded-lg bg-soft px-3 py-1.5 text-xs font-semibold text-fg transition hover:bg-line">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-subtle">{q ? <>No products match &ldquo;{q}&rdquo;.</> : "No products yet — add your first one to get started."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
