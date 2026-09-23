"use client";
import { Heart, ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGridSkeleton } from "@/components/ui/LoadingState";
import { getProductById } from "@/lib/catalog";
import { availableOf, useCart, useOrders, useReady, useUI, useWishlist } from "@/store";
import type { Product } from "@/lib/types";

export function WishlistContent({ heading = true }: { heading?: boolean }) {
  const ready = useReady();
  const ids = useWishlist((s) => s.ids);
  const sold = useOrders((s) => s.soldCounts);
  const add = useCart((s) => s.add);
  const toast = useUI((s) => s.toast);
  const bump = useUI((s) => s.bump);
  const items = useMemo(() => ids.map(getProductById).filter((p): p is Product => !!p), [ids]);
  const available = items.filter((p) => availableOf(p, sold) > 0);

  const addAll = () => {
    let n = 0;
    available.forEach((p) => { if (add(p) === "added") n++; });
    if (n) { bump(); toast({ kind: "success", title: `${n} ${n === 1 ? "pair" : "pairs"} added to your bag`, action: { label: "View bag", href: "/cart" } }); }
    else toast({ kind: "info", title: "Everything available is already in your bag" });
  };

  if (!ready) return <ProductGridSkeleton count={4} />;
  if (items.length === 0)
    return <EmptyState icon={Heart} title="Your wishlist is empty" message="Tap the heart on any pair to save it here. Since most items are one-of-one, saving is the best way to keep track." primary={{ label: "Explore the shop", href: "/shop" }} secondary={{ label: "New arrivals", href: "/new-arrivals" }} />;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        {heading ? <p className="text-sm text-muted">{items.length} saved · {available.length} available</p> : <span />}
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={addAll} disabled={available.length === 0} icon={<ShoppingBag className="size-4" />}>Add all available to bag</Button>
        </div>
      </div>
      <ProductGrid products={items} />
    </>
  );
}

export function WishlistClient() {
  return (
    <div className="container-x pb-10 pt-6 sm:pt-8">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="mb-8 mt-6 text-5xl sm:text-6xl">Wishlist</h1>
      <WishlistContent />
    </div>
  );
}
