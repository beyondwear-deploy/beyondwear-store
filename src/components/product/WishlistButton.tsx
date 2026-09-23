"use client";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/format";
import { useReady, useUI, useWishlist } from "@/store";

export function WishlistButton({ productId, name, className, size = "md", withLabel = false }: { productId: string; name: string; className?: string; size?: "sm" | "md"; withLabel?: boolean }) {
  const ready = useReady();
  const active = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  const toast = useUI((s) => s.toast);
  const [pop, setPop] = useState(0);
  const on = ready && active;
  useEffect(() => { if (!pop) return; const t = setTimeout(() => setPop(0), 600); return () => clearTimeout(t); }, [pop]);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      onClick={(e) => {
        e.preventDefault(); e.stopPropagation();
        const added = toggle(productId);
        if (added) { setPop(Date.now()); toast({ kind: "success", title: "Saved to wishlist", action: { label: "View wishlist", href: "/wishlist" } }); }
      }}
      className={cn(
        "grid place-items-center rounded-full transition-all duration-300 active:scale-90",
        withLabel ? "h-14 gap-2 border border-line-strong px-5 text-xs font-semibold uppercase tracking-[0.09em] hover:border-fg" : cn("glass shadow-soft hover:scale-110", size === "sm" ? "size-9" : "size-10"),
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <Heart className={cn("size-[18px] transition-colors duration-300", pop ? "heart-pop" : "", on ? "fill-accent stroke-accent" : "stroke-current")} aria-hidden />
        {withLabel && <span>{on ? "Saved" : "Wishlist"}</span>}
      </span>
    </button>
  );
}
