"use client";
import { ArrowRight, Clock, Flame, Search, SearchX, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { ConditionBadge } from "@/components/ui/Badge";
import { SearchSkeleton } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { getAllProducts, popular } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { comingSoonMatch, getSuggestions, POPULAR_SEARCHES, searchProducts } from "@/lib/search";
import { useReady, useRecent, useUI } from "@/store";

export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const router = useRouter();
  const ready = useReady();
  const recent = useRecent((s) => s.searches);
  const addSearch = useRecent((s) => s.addSearch);
  const removeSearch = useRecent((s) => s.removeSearch);
  const clearSearches = useRecent((s) => s.clearSearches);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!q.trim()) { setDebounced(""); setBusy(false); return; }
    setBusy(true);
    const t = setTimeout(() => { setDebounced(q); setBusy(false); }, 180);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => { if (!open) { setQ(""); setDebounced(""); } }, [open]);

  const hits = useMemo(() => (debounced ? searchProducts(debounced) : []), [debounced]);
  const soonMatch = useMemo(() => (debounced && hits.length === 0 ? comingSoonMatch(debounced) : undefined), [debounced, hits.length]);
  const suggestions = useMemo(() => (debounced ? getSuggestions(debounced, 0).filter((s) => s.kind !== "product") : []), [debounced]);
  const trending = useMemo(() => popular(getAllProducts()).slice(0, 4), []);
  const close = () => setOpen(false);

  const submit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    addSearch(t);
    close();
    router.push(`/search?q=${encodeURIComponent(t)}`);
  };

  const chip = "rounded-full border border-line-strong px-4 py-2 text-xs font-semibold transition hover:bg-fg hover:text-bg active:scale-95";

  return (
    <Modal open={open} onClose={close} title="Search" hideTitle variant="top" initialFocusRef={input}>
      <form role="search" onSubmit={(e) => { e.preventDefault(); submit(q); }} className="border-b border-line">
        <div className="container-x flex items-center gap-3 py-4 sm:py-5">
          <Search className="size-5 shrink-0 text-muted" aria-hidden />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} type="search" name="q" autoComplete="off" spellCheck={false} maxLength={80}
            aria-label="Search products, brands and categories" placeholder="Search — try “black Nike shoes”"
            className="h-11 min-w-0 flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-subtle sm:text-3xl [&::-webkit-search-cancel-button]:hidden" />
          {q && <button type="button" onClick={() => { setQ(""); input.current?.focus(); }} aria-label="Clear search" className="grid size-10 place-items-center rounded-full text-muted hover:bg-soft hover:text-fg"><X className="size-5" /></button>}
          <button type="button" onClick={close} className="hidden rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted hover:bg-soft hover:text-fg sm:block">Esc</button>
          <button type="button" onClick={close} aria-label="Close search" className="grid size-10 place-items-center rounded-full hover:bg-soft sm:hidden"><X className="size-5" /></button>
        </div>
      </form>

      <div className="overflow-y-auto">
        <div className="container-x py-6 sm:py-8" aria-live="polite">
          {!q.trim() ? (
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div className="space-y-8">
                {ready && recent.length > 0 && (
                  <section aria-labelledby="recent-h">
                    <div className="mb-3 flex items-center justify-between"><h3 id="recent-h" className="eyebrow flex items-center gap-2 !font-sans"><Clock className="size-3.5" aria-hidden /> Recent searches</h3><button type="button" onClick={clearSearches} className="link-underline text-xs text-muted hover:text-fg">Clear all</button></div>
                    <ul className="flex flex-wrap gap-2">
                      {recent.map((r) => (
                        <li key={r} className="flex items-center rounded-full border border-line-strong">
                          <button type="button" onClick={() => submit(r)} className="rounded-l-full py-2 pl-4 pr-2 text-xs font-semibold hover:text-accent">{r}</button>
                          <button type="button" onClick={() => removeSearch(r)} aria-label={`Remove ${r} from recent searches`} className="rounded-r-full py-2 pl-1 pr-3 text-subtle hover:text-danger"><X className="size-3.5" /></button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                <section aria-labelledby="pop-h">
                  <h3 id="pop-h" className="eyebrow mb-3 flex items-center gap-2 !font-sans"><Flame className="size-3.5" aria-hidden /> Popular searches</h3>
                  <ul className="flex flex-wrap gap-2">{POPULAR_SEARCHES.map((p) => <li key={p}><button type="button" onClick={() => submit(p)} className={chip}>{p}</button></li>)}</ul>
                </section>
              </div>
              <section aria-labelledby="trend-h">
                <h3 id="trend-h" className="eyebrow mb-3 !font-sans">Trending now</h3>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {trending.map((p) => (
                    <li key={p.id}>
                      <Link href={`/product/${p.slug}`} onClick={close} className="group block">
                        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-soft"><div className="h-full w-full transition-transform duration-700 group-hover:scale-105"><ProductImage product={p} /></div></div>
                        <p className="mt-2 truncate text-xs font-semibold">{p.brand} {p.name}</p>
                        <p className="text-xs text-muted">{formatPrice(p.price)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : busy ? (
            <div className="max-w-2xl"><SearchSkeleton /></div>
          ) : hits.length === 0 ? (
            <div className="mx-auto flex max-w-md flex-col items-center py-8 text-center">
              <div className="mb-5 grid size-16 place-items-center rounded-full bg-soft"><SearchX className="size-7" strokeWidth={1.5} aria-hidden /></div>
              {soonMatch ? (
                <>
                  <h3 className="text-2xl">{soonMatch.label} are coming soon</h3>
                  <p className="mt-2 text-sm text-muted">We&apos;re launching with shoes first. <Link href="/coming-soon#notify" onClick={close} className="font-semibold underline underline-offset-4">Get notified</Link> when this opens, or try “sneakers” or “boots”.</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl">No results for “{debounced}”</h3>
                  <p className="mt-2 text-sm text-muted">Check the spelling, or try a broader term like “sneakers” or “boots”.</p>
                </>
              )}
              <ul className="mt-6 flex flex-wrap justify-center gap-2">{POPULAR_SEARCHES.slice(0, 4).map((p) => <li key={p}><button type="button" onClick={() => setQ(p)} className={chip}>{p}</button></li>)}</ul>
              <button type="button" onClick={() => { setQ(""); input.current?.focus(); }} className="link-underline mt-6 text-xs font-bold uppercase tracking-wider">Clear search</button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
              <section aria-label="Product results">
                <p className="eyebrow mb-4">{hits.length} result{hits.length === 1 ? "" : "s"}</p>
                <ul className="space-y-1">
                  {hits.slice(0, 6).map(({ product: p }) => (
                    <li key={p.id}>
                      <Link href={`/product/${p.slug}`} onClick={() => { addSearch(debounced); close(); }} className="group flex items-center gap-4 rounded-2xl p-2 transition hover:bg-soft">
                        <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-soft"><ProductImage product={p} /></div>
                        <div className="min-w-0 flex-1">
                          <p className="eyebrow !text-[10px]">{p.brand}</p>
                          <p className="truncate text-sm font-medium">{p.name} <span className="text-muted">· {p.color} · {p.size}</span></p>
                          <ConditionBadge condition={p.condition} className="mt-1 !px-2 !py-0.5 !text-[9px]" />
                        </div>
                        <p className="text-sm font-bold">{p.stock <= 0 ? <span className="text-subtle">Sold</span> : formatPrice(p.price)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => submit(debounced)} className="group mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] hover:text-accent">
                  View all {hits.length} results <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </button>
              </section>
              {suggestions.length > 0 && (
                <aside aria-label="Suggestions">
                  <p className="eyebrow mb-4">Suggestions</p>
                  <ul className="space-y-1">
                    {suggestions.map((s) => (
                      <li key={s.href}><Link href={s.href} onClick={close} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-soft"><span className="font-medium">{s.label}</span><span className="text-xs text-subtle">{s.hint}</span></Link></li>
                    ))}
                  </ul>
                </aside>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
