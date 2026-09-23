import { siteConfig } from "@/lib/config";
import { formatPrice } from "@/lib/format";

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const std = siteConfig.delivery[0];
  const target = std.freeOver ?? 0;
  if (!target) return null;
  const left = Math.max(0, target - subtotal);
  const pct = Math.min(100, (subtotal / target) * 100);
  return (
    <div>
      <p className="mb-2 text-xs text-muted" aria-live="polite">
        {left > 0 ? <>Add <b className="text-fg">{formatPrice(left)}</b> more for free delivery</> : <b className="text-success">You've unlocked free standard delivery</b>}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-soft" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Progress to free delivery">
        <div className="h-full rounded-full bg-accent transition-[width] duration-700 ease-[var(--ease)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
