export function BreakdownBars({ items, valueFormat }: { items: { label: string; value: number }[]; valueFormat?: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const fmt = valueFormat ?? ((n: number) => String(n));
  if (!items.length) return <p className="py-8 text-center text-sm text-subtle">No data yet.</p>;
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="truncate text-fg">{i.label}</span>
            <span className="shrink-0 tabular-nums font-semibold text-muted">{fmt(i.value)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-soft">
            <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(4, (i.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
