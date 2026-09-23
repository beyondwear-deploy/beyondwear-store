import { cn, conditionMeta } from "@/lib/format";
import type { Condition } from "@/lib/types";
import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "accent" | "dark" | "success" | "danger"; className?: string }) {
  const tones = {
    neutral: "bg-elev text-fg border border-line",
    accent: "bg-accent text-accent-fg",
    dark: "bg-fg text-bg",
    success: "bg-success-soft text-success",
    danger: "bg-danger-soft text-danger",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]", tones[tone], className)}>
      {children}
    </span>
  );
}

export function ConditionBadge({ condition, className, showDot = true }: { condition: Condition; className?: string; showDot?: boolean }) {
  const m = conditionMeta(condition);
  const key = condition === "like-new" ? "likenew" : condition;
  return (
    <span
      title={m.description}
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]", className)}
      style={{ background: `var(--cond-${key}-bg)`, color: `var(--cond-${key}-fg)` }}
    >
      {showDot && <span aria-hidden className="size-1.5 rounded-full" style={{ background: `var(--cond-${key}-dot)` }} />}
      {m.short}
    </span>
  );
}
