import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/format";

export function KpiCard({
  label, value, icon: Icon, hint, trend,
}: {
  label: string; value: string; icon: LucideIcon; hint?: string; trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-2xl border border-line bg-elev p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</p>
        <Icon className="size-4 text-accent" aria-hidden />
      </div>
      <p className="text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
      {(hint || trend) && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-subtle">
          {trend && <span className={cn("font-semibold", trend.positive ? "text-success" : "text-danger")}>{trend.value}</span>}
          {hint}
        </p>
      )}
    </div>
  );
}
