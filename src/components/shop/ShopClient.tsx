"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, PackageSearch, SearchX, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductFilter, type Counts } from "@/components/product/ProductFilter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ComingSoonPanel } from "@/components/shop/ComingSoon";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGridSkeleton } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { comingSoonFor, getAllProducts, getFacets } from "@/lib/catalog";
import { cn } from "@/lib/format";
import { activeChips, countActive, filterProducts, parseFilters, serializeFilters, SORTS, sortProducts, type Filters } from "@/lib/filters";
import { comingSoonMatch, POPULAR_SEARCHES } from "@/lib/search";
import { availableOf, useOrders, useRecent } from "@/store";

const PAGE = 24;
const EMPTY: Partial<Filters> = {};

type NavItem = { label: string; kind: "all" | "gender" | "type"; value?: string };
const BASE_NAV: NavItem[] = [
  { label: "All Shoes", kind: "all" },
  { label: "Men", kind: "gender", value: "men" },
  { label: "Women", kind: "gender", value: "women" },
  { label: "Kids", kind: "gender", value: "kids" },
];

interface Props {
  title: string;
  eyebrow?: string;
  blurb?: string;
  crumbs: Crumb[];
  defaults?: Partial<Filters>;
  isSearch?: boolean;
  showCategoryNav?: boolean;
}

export function ShopClient({ title, eyebrow, blurb, crumbs, defaults = EMPTY, isSearch, showCategoryNav = true }: Props) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const soldCounts = useOrders((s) => s.soldCounts);
  const addSearch = useRecent((s) => s.addSearch);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE);
  const [loading, setLoading] = useState(true);

  const filters = useMemo(() => parseFilters(sp, defaults), [sp, defaults]);
  const all = useMemo(() => getAllProducts(), []);
  const facets = useMemo(() => getFacets(all), [all]);
  const NAV = useMemo<NavItem[]>(() => {
    const byCount = new Map<string, number>();
    all.forEach((p) => byCount.set(p.type, (byCount.get(p.type) ?? 0) + 1));
    const types = Array.from(byCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => ({ label: t, kind: "type" as const, value: t }));
    return [...BASE_NAV, ...types];
  }, [all]);
  const soon = filters.category.map(comingSoonFor).find(Boolean);
  const soonQuery = filters.q ? comingSoonMatch(filters.q) : undefined;
  const avail = useCallback((p: (typeof all)[number]) => availableOf(p, soldCounts), [soldCounts]);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 380); return () => clearTimeout(t); }, []);
  const key = serializeFilters(filters, defaults);
  useEffect(() => { setVisible(PAGE); }, [key]);
  useEffect(() => { if (isSearch && filters.q) addSearch(filters.q); }, [isSearch, filters.q, addSearch]);

  const update = useCallback((patch: Partial<Filters>) => {
    const qs = serializeFilters({ ...filters, ...patch }, defaults);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filters, defaults, pathname, router]);
  const clear = useCallback(() => {
    const qs = serializeFilters({ q: filters.q, sort: filters.sort } as Filters, defaults);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filters.q, filters.sort, defaults, pathname, router]);

  const results = useMemo(() => sortProducts(filterProducts(all, filters, avail), filters.sort, avail, filters.q), [all, filters, avail]);

  const counts: Counts = useMemo(() => {
    const c: Counts = { category: {}, gender: {}, size: {}, brand: {}, condition: {}, color: {}, type: {} };
    (["category", "size", "brand", "condition", "color", "type"] as const).forEach((k) => {
      filterProducts(all, filters, avail, k).forEach((p) => {
        const v = k === "category" ? p.category : k === "size" ? p.size : k === "brand" ? p.brand : k === "condition" ? p.condition : k === "color" ? p.color : p.type;
        c[k][v] = (c[k][v] ?? 0) + 1;
      });
    });
    filterProducts(all, filters, avail, "gender").forEach((p) => {
      if (p.gender === "unisex") { c.gender.men = (c.gender.men ?? 0) + 1; c.gender.women = (c.gender.women ?? 0) + 1; }
      else c.gender[p.gender] = (c.gender[p.gender] ?? 0) + 1;
    });
    return c;
  }, [all, filters, avail]);

  const chips = activeChips(filters);
  const activeCount = countActive(filters, defaults);
  const removeChip = (c: (typeof chips)[number]) => {
    if (c.key === "min" || c.key === "max") update({ [c.key]: null } as Partial<Filters>);
    else if (c.key === "availability") update({ availability: "all" });
    else update({ [c.key]: (filters[c.key] as string[]).filter((x) => x !== c.value) } as Partial<Filters>);
  };

  const navActive = (n: NavItem) =>
    n.kind === "all" ? !filters.category.length && !filters.gender.length && !filters.type.length
    : n.kind === "gender" ? filters.gender.length === 1 && filters.gender[0] === n.value && !filters.category.length && !filters.type.length
    : filters.type.length === 1 && filters.type[0] === n.value;
  const navClick = (n: NavItem) =>
    n.kind === "all" ? update({ category: [], gender: [], type: [] })
    : n.kind === "gender" ? update({ gender: [n.value!], category: [], type: [] })
    : update({ type: [n.value!], category: [] });

  const shown = results.slice(0, visible);

  if (soon) {
    return (
      <div className="container-x pb-8 pt-6 sm:pt-8">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: soon.label }]} />
        <header className="mb-10 mt-6"><p className="eyebrow">Coming soon</p><h1 className="mt-3 text-5xl leading-none sm:text-7xl">{soon.label}</h1></header>
        <ComingSoonPanel label={soon.label} blurb={soon.blurb} />
      </div>
    );
  }

  const filterPanel = (id: string) => <ProductFilter idPrefix={id} filters={filters} facets={facets} counts={counts} onChange={update} onClear={clear} />;

  return (
    <div className="container-x pb-8 pt-6 sm:pt-8">
      <Breadcrumbs items={crumbs} />
      <header className="mb-8 mt-6 flex flex-col gap-3 sm:mb-10">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="text-5xl leading-none sm:text-7xl">{isSearch && filters.q ? <>Results for <em className="text-accent">“{filters.q}”</em></> : title}</h1>
        {blurb && !filters.q && <p className="max-w-xl text-muted sm:text-lg">{blurb}</p>}
      </header>

      {showCategoryNav && (
        <nav aria-label="Categories" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-7 sm:px-7 lg:mx-0 lg:px-0">
          {NAV.map((n) => {
            const on = navActive(n);
            return <button key={n.label} type="button" aria-pressed={on} onClick={() => navClick(n)} className={cn("shrink-0 rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition active:scale-95", on ? "border-fg bg-fg text-bg" : "border-line-strong hover:border-fg")}>{n.label}</button>;
          })}
          <Link href="/coming-soon" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-dashed border-line-strong px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-muted transition hover:border-fg hover:text-fg">Clothing &amp; bags <span className="rounded-full bg-fg px-2 py-0.5 text-[9px] tracking-[0.12em] text-bg">Soon</span></Link>
        </nav>
      )}

      <div className="flex items-center justify-between gap-3 border-y border-line py-3.5">
        <p className="shrink-0 whitespace-nowrap text-sm font-semibold" aria-live="polite" role="status">{loading ? "Loading…" : `${results.length} ${results.length === 1 ? "Pair" : "Pairs"}`}</p>
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={() => setMobileOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-xs font-bold uppercase tracking-[0.1em] transition hover:border-fg active:scale-95 lg:hidden">
            <SlidersHorizontal className="size-4" aria-hidden />Filters{activeCount > 0 && <span className="rounded-full bg-accent px-1.5 text-[10px] text-accent-fg">{activeCount}</span>}
          </button>
          <label className="relative min-w-0">
            <span className="sr-only">Sort by</span>
            <select value={filters.sort === "relevance" && !filters.q ? "featured" : filters.sort} onChange={(e) => update({ sort: e.target.value as Filters["sort"] })} className="h-11 w-full max-w-[9.5rem] appearance-none truncate rounded-full border border-line-strong bg-transparent pl-4 pr-10 sm:max-w-none text-xs font-bold uppercase tracking-[0.08em] outline-none transition hover:border-fg focus:border-fg">
              {filters.q && <option value="relevance">Relevance</option>}
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2" aria-hidden />
          </label>
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map((c) => (
            <li key={c.key + (c.value ?? "")}>
              <button type="button" onClick={() => removeChip(c)} className="group inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-xs font-semibold transition hover:bg-line" aria-label={`Remove filter: ${c.label}`}>{c.label}<X className="size-3 opacity-60 group-hover:opacity-100" aria-hidden /></button>
            </li>
          ))}
          <li><button type="button" onClick={clear} className="link-underline px-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-fg">Clear all</button></li>
        </ul>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-3 [scrollbar-width:thin]">{filterPanel("d")}</div>
        </aside>

        <section aria-label="Products" className="min-w-0">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : results.length === 0 ? (
            soonQuery ? (
              <EmptyState icon={PackageSearch} title={`${soonQuery.label} are coming soon`} message="We're launching with shoes first. Join the list and we'll tell you the moment this opens." primary={{ label: "Get notified", href: "/coming-soon#notify" }} secondary={{ label: "Shop shoes", href: "/shop" }} />
            ) : isSearch && filters.q ? (
              <EmptyState icon={SearchX} title={`No results for “${filters.q}”`} message="We couldn't find a match. Check the spelling, try fewer words, or browse a category." primary={{ label: "Browse all products", href: "/shop" }}>
                <ul className="mt-6 flex flex-wrap justify-center gap-2">{POPULAR_SEARCHES.slice(0, 5).map((p) => <li key={p}><Link href={`/search?q=${encodeURIComponent(p)}`} className="rounded-full border border-line-strong px-4 py-2 text-xs font-semibold transition hover:bg-fg hover:text-bg">{p}</Link></li>)}</ul>
              </EmptyState>
            ) : (
              <EmptyState icon={PackageSearch} title="No pairs match your filters" message="Try removing a filter or two — or browse everything we have." primary={{ label: "Clear all filters", onClick: clear }} secondary={{ label: "View new arrivals", href: "/new-arrivals" }} />
            )
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                  <ProductGrid products={shown} priorityCount={4} className="md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4" />
                </motion.div>
              </AnimatePresence>
              {results.length > visible && (
                <div className="mt-14 flex flex-col items-center gap-3">
                  <p className="text-xs text-muted">Showing {shown.length} of {results.length}</p>
                  <div className="h-1 w-48 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-fg transition-all duration-500" style={{ width: `${(shown.length / results.length) * 100}%` }} /></div>
                  <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + PAGE)}>Load more</Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Modal open={mobileOpen} onClose={() => setMobileOpen(false)} title="Filters">
        <div className="flex-1 overflow-y-auto px-5 pb-4">{filterPanel("m")}</div>
        <div className="flex gap-3 border-t border-line bg-elev p-4">
          <Button variant="outline" onClick={clear} className="flex-1">Clear</Button>
          <Button onClick={() => setMobileOpen(false)} className="flex-[2]">Show {results.length} {results.length === 1 ? "pair" : "pairs"}</Button>
        </div>
      </Modal>
    </div>
  );
}
