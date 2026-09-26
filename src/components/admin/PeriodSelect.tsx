"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PERIOD_OPTIONS, type Period } from "@/lib/period";

/** Day/Week/Month/Quarter/Year/All-time dropdown — writes `?period=` to the URL so the value survives navigation and reload, and every report reading the same param stays in sync. */
export function PeriodSelect({ value }: { value: Period }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("period");
    else params.set("period", next);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-subtle">Period</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-line bg-elev px-3 py-1.5 text-sm font-medium outline-none focus:border-accent"
      >
        {PERIOD_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
