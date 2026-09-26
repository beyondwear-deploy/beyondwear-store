/**
 * PERIOD FILTER — the day/week/month/quarter/year dropdown shared by every
 * financial report and analytics page in the admin panel. One definition
 * here keeps "what does 'this month' mean" consistent everywhere it's used.
 *
 * All periods are "to date" windows anchored on the server's current time
 * (e.g. "month" = the 1st of this calendar month through now) — there's no
 * historical period picker (no "March 2025"), just a rolling lens on the
 * current day/week/month/quarter/year, plus "All time".
 */

export type Period = "today" | "week" | "month" | "quarter" | "year" | "all";

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
  { value: "all", label: "All time" },
];

const VALID_PERIODS = new Set(PERIOD_OPTIONS.map((o) => o.value));

/** Parses a raw `?period=` query value (string | string[] | undefined) into a valid Period, defaulting to "all". */
export function parsePeriod(raw: string | string[] | undefined): Period {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && VALID_PERIODS.has(v as Period) ? (v as Period) : "all";
}

export function periodLabel(period: Period): string {
  return PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "All time";
}

/** Start of the selected rolling window, or null for "all" (no lower bound). Weeks start Monday. */
export function periodStart(period: Period, now: Date = new Date()): Date | null {
  if (period === "all") return null;
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (period) {
    case "today":
      return d;
    case "week": {
      const day = d.getDay(); // 0 = Sunday
      const diff = (day + 6) % 7; // days since Monday
      d.setDate(d.getDate() - diff);
      return d;
    }
    case "month":
      return new Date(d.getFullYear(), d.getMonth(), 1);
    case "quarter":
      return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
    case "year":
      return new Date(d.getFullYear(), 0, 1);
  }
}

/** How many trailing days a trend chart should show for a given period (daily granularity throughout, just a longer or shorter window). */
export function periodChartDays(period: Period): number {
  switch (period) {
    case "today": return 1;
    case "week": return 7;
    case "month": return 31;
    case "quarter": return 92;
    case "year": return 366;
    case "all": return 366; // cap "all time" trend charts at a year so they stay readable
  }
}

/** True if the ISO timestamp falls within [periodStart(period), now]. */
export function isWithinPeriod(iso: string, period: Period, now: Date = new Date()): boolean {
  const start = periodStart(period, now);
  if (!start) return true;
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= now.getTime();
}
