import { ConditionBadge } from "@/components/ui/Badge";
import { CONDITIONS, cn, conditionMeta } from "@/lib/format";
import type { Condition } from "@/lib/types";

/** 5-step scale (Fair → New) so the grade is understood at a glance. */
export function ConditionMeter({ condition }: { condition: Condition }) {
  const cur = conditionMeta(condition);
  const steps = [...CONDITIONS].sort((a, b) => a.rank - b.rank);
  return (
    <div>
      <div className="flex items-center gap-3">
        <ConditionBadge condition={condition} />
        <p className="text-sm text-muted">{cur.description}</p>
      </div>
      <ol className="mt-4 grid grid-cols-5 gap-1.5" aria-label="Condition scale from Fair to New / Unused">
        {steps.map((s) => {
          const active = s.rank <= cur.rank;
          const key = s.id === "like-new" ? "likenew" : s.id;
          return (
            <li key={s.id} aria-current={s.id === condition ? "true" : undefined}>
              <div className={cn("h-1.5 rounded-full transition-colors", !active && "bg-soft")} style={active ? { background: `var(--cond-${key === cur.id ? (condition === "like-new" ? "likenew" : condition) : key}-dot)` } : undefined} />
              <p className={cn("mt-1.5 text-[9px] font-bold uppercase leading-tight tracking-[0.08em]", s.id === condition ? "text-fg" : "text-subtle")}>{s.short}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
