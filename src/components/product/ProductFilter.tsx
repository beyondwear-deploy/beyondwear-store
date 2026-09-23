"use client";
import { ChevronDown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { ConditionBadge } from "@/components/ui/Badge";
import { CATEGORIES, GENDERS, LIVE_CATEGORIES } from "@/lib/catalog";
import { CONDITIONS, cn, formatPrice } from "@/lib/format";
import type { Availability, Filters } from "@/lib/filters";

export interface Facets {
  brands: string[]; sizes: string[]; types: string[]; colors: { name: string; hex: string }[]; minPrice: number; maxPrice: number;
}
export type Counts = Record<"category" | "gender" | "size" | "brand" | "condition" | "color" | "type", Record<string, number>>;

function Group({ title, children, defaultOpen = true, count = 0 }: { title: string; children: ReactNode; defaultOpen?: boolean; count?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = title.replace(/\s/g, "-").toLowerCase();
  return (
    <div className="border-b border-line py-5">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`fg-${id}`} className="flex w-full items-center justify-between text-left text-xs font-bold uppercase tracking-[0.16em]">
        <span>{title}{count > 0 && <span className="ml-2 rounded-full bg-fg px-1.5 py-0.5 text-[9px] text-bg">{count}</span>}</span>
        <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>
      <div id={`fg-${id}`} hidden={!open} className="mt-4">{children}</div>
    </div>
  );
}

function Check({ label, checked, onChange, count, extra }: { label: ReactNode; checked: boolean; onChange: () => void; count?: number; extra?: ReactNode }) {
  return (
    <label className={cn("group flex cursor-pointer items-center gap-3 rounded-lg py-1.5 text-sm transition", count === 0 && !checked && "opacity-40")}>
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span aria-hidden className="grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-line-strong bg-elev transition peer-checked:border-fg peer-checked:bg-fg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)] group-hover:border-fg [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
        <svg viewBox="0 0 14 14" className="size-2.5 text-bg"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="flex-1">{label}</span>
      {extra}
      {count !== undefined && <span className="text-xs tabular-nums text-subtle">{count}</span>}
    </label>
  );
}

function Radio({ label, checked, onChange, name, count }: { label: string; checked: boolean; onChange: () => void; name: string; count?: number }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5 text-sm">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span aria-hidden className="grid size-[18px] place-items-center rounded-full border border-line-strong bg-elev transition peer-checked:border-fg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)] group-hover:border-fg [&>i]:scale-0 peer-checked:[&>i]:scale-100"><i className="block size-2 rounded-full bg-fg transition" /></span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs tabular-nums text-subtle">{count}</span>}
    </label>
  );
}

export function ProductFilter({ filters, facets, counts, onChange, onClear, idPrefix = "f" }: {
  filters: Filters; facets: Facets; counts: Counts; onChange: (patch: Partial<Filters>) => void; onClear: () => void; idPrefix?: string;
}) {
  const toggle = (key: "category" | "gender" | "size" | "brand" | "condition" | "color" | "type", v: string) => {
    const cur = filters[key];
    onChange({ [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] } as Partial<Filters>);
  };
  const [lo, setLo] = useState(filters.min ?? facets.minPrice);
  const [hi, setHi] = useState(filters.max ?? facets.maxPrice);
  useEffect(() => { setLo(filters.min ?? facets.minPrice); setHi(filters.max ?? facets.maxPrice); }, [filters.min, filters.max, facets.minPrice, facets.maxPrice]);
  const commit = (l: number, h: number) => onChange({ min: l <= facets.minPrice ? null : l, max: h >= facets.maxPrice ? null : h });
  const span = facets.maxPrice - facets.minPrice || 1;
  const step = 100;

  return (
    <div>
      {LIVE_CATEGORIES.length > 1 && <Group title="Category" count={filters.category.length}>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => LIVE_CATEGORIES.includes(c.id)).map((c) => {
            const on = filters.category.includes(c.id);
            return (
              <button key={c.id} type="button" aria-pressed={on} onClick={() => toggle("category", c.id)} className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95", on ? "border-fg bg-fg text-bg" : "border-line-strong hover:border-fg", !on && (counts.category[c.id] ?? 0) === 0 && "opacity-40")}>
                {c.label} <span className="opacity-60">{counts.category[c.id] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </Group>}
      <Group title="Gender" count={filters.gender.length}>
        {GENDERS.filter((g) => g.id !== "unisex").map((g) => <Check key={g.id} label={g.label} checked={filters.gender.includes(g.id)} onChange={() => toggle("gender", g.id)} count={counts.gender[g.id] ?? 0} />)}
      </Group>
      <Group title="Size" count={filters.size.length}>
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((s) => {
            const on = filters.size.includes(s);
            return <button key={s} type="button" aria-pressed={on} onClick={() => toggle("size", s)} className={cn("min-w-11 rounded-lg border px-2.5 py-2 text-xs font-semibold transition active:scale-95", on ? "border-fg bg-fg text-bg" : "border-line-strong hover:border-fg", !on && (counts.size[s] ?? 0) === 0 && "opacity-35")}>{s}</button>;
          })}
        </div>
      </Group>
      <Group title="Brand" count={filters.brand.length} defaultOpen={false}>
        <div className="max-h-64 overflow-y-auto pr-2">{facets.brands.map((b) => <Check key={b} label={b} checked={filters.brand.includes(b)} onChange={() => toggle("brand", b)} count={counts.brand[b] ?? 0} />)}</div>
      </Group>
      <Group title="Condition" count={filters.condition.length}>
        {CONDITIONS.map((c) => <Check key={c.id} label={<ConditionBadge condition={c.id} />} checked={filters.condition.includes(c.id)} onChange={() => toggle("condition", c.id)} count={counts.condition[c.id] ?? 0} />)}
      </Group>
      <Group title="Price range" count={(filters.min !== null ? 1 : 0) + (filters.max !== null ? 1 : 0)}>
        <div className="px-1">
          <div className="relative h-6" role="group" aria-label="Price range">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-soft" />
            <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-fg" style={{ left: `${((lo - facets.minPrice) / span) * 100}%`, right: `${100 - ((hi - facets.minPrice) / span) * 100}%` }} />
            <input type="range" className="dual" aria-label="Minimum price" min={facets.minPrice} max={facets.maxPrice} step={step} value={lo}
              onChange={(e) => setLo(Math.min(+e.target.value, hi - step))} onPointerUp={() => commit(lo, hi)} onKeyUp={() => commit(lo, hi)} onBlur={() => commit(lo, hi)} />
            <input type="range" className="dual" aria-label="Maximum price" min={facets.minPrice} max={facets.maxPrice} step={step} value={hi}
              onChange={(e) => setHi(Math.max(+e.target.value, lo + step))} onPointerUp={() => commit(lo, hi)} onKeyUp={() => commit(lo, hi)} onBlur={() => commit(lo, hi)} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-semibold tabular-nums"><span>{formatPrice(lo)}</span><span className="text-subtle">to</span><span>{formatPrice(hi)}</span></div>
        </div>
      </Group>
      <Group title="Color" count={filters.color.length} defaultOpen={false}>
        <div className="flex flex-wrap gap-2.5">
          {facets.colors.map((c) => {
            const on = filters.color.includes(c.name);
            return (
              <button key={c.name} type="button" aria-pressed={on} aria-label={c.name} title={c.name} onClick={() => toggle("color", c.name)} className={cn("relative size-8 rounded-full ring-1 ring-line-strong transition active:scale-90", on && "ring-2 ring-offset-2 ring-offset-bg ring-fg", !on && (counts.color[c.name] ?? 0) === 0 && "opacity-30")} style={{ background: c.hex }} />
            );
          })}
        </div>
      </Group>
      <Group title="Availability" count={filters.availability !== "all" ? 1 : 0}>
        {([["all", "All items"], ["in-stock", "In stock"], ["sold", "Sold out"]] as [Availability, string][]).map(([v, l]) => <Radio key={v} name={`${idPrefix}-avail`} label={l} checked={filters.availability === v} onChange={() => onChange({ availability: v })} />)}
      </Group>
      <Group title="Style" count={filters.type.length}>
        <div className="max-h-64 overflow-y-auto pr-2">{facets.types.map((t) => <Check key={t} label={t} checked={filters.type.includes(t)} onChange={() => toggle("type", t)} count={counts.type[t] ?? 0} />)}</div>
      </Group>
      <button type="button" onClick={onClear} className="link-underline mt-5 text-xs font-bold uppercase tracking-[0.14em] text-muted hover:text-fg">Clear all filters</button>
    </div>
  );
}
