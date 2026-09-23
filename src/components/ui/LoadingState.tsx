import { cn } from "@/lib/format";

export const Skeleton = ({ className }: { className?: string }) => <div aria-hidden className={cn("skeleton", className)} />;

export function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="aspect-[4/5] rounded-2xl" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading products" className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
      <span className="sr-only">Loading products…</span>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading product" className="container-x grid gap-10 py-10 lg:grid-cols-[1.15fr_1fr]">
      <div className="grid grid-cols-[72px_1fr] gap-4">
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)}</div>
        <Skeleton className="aspect-[4/5] rounded-3xl" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-3/4" /><Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" /><Skeleton className="h-14 w-full rounded-full" /><Skeleton className="h-14 w-full rounded-full" />
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div role="status" aria-label="Loading your bag" className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4"><Skeleton className="h-28 w-24 shrink-0" /><div className="flex-1 space-y-2 pt-1"><Skeleton className="h-3 w-1/4" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/3" /></div></div>
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div role="status" aria-label="Searching" className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3"><Skeleton className="size-14 shrink-0 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div></div>
      ))}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span role="status" aria-label="Loading" className={cn("inline-block size-5 animate-spin rounded-full border-2 border-line-strong border-t-fg", className)} />;
}
