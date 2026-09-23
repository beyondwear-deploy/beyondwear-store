import { categoryLabel } from "./catalog";
import { searchProducts } from "./search";
import type { Category, Condition, Product } from "./types";

export type SortId = "featured" | "newest" | "price-asc" | "price-desc" | "popular" | "recent" | "relevance";
export type Availability = "all" | "in-stock" | "sold";

export interface Filters {
  q: string;
  category: string[];
  gender: string[];
  size: string[];
  brand: string[];
  condition: string[];
  color: string[];
  type: string[];
  min: number | null;
  max: number | null;
  availability: Availability;
  sort: SortId;
}

export const SORTS: { id: SortId; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "popular", label: "Popular" },
  { id: "recent", label: "Recently Added" },
];

const list = (v: string | null) => (v ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
const num = (v: string | null) => { const n = v ? parseInt(v, 10) : NaN; return Number.isFinite(n) ? n : null; };

export function parseFilters(sp: { get(k: string): string | null }, defaults: Partial<Filters> = {}): Filters {
  const q = (sp.get("q") ?? defaults.q ?? "").slice(0, 80);
  const sortRaw = sp.get("sort") as SortId | null;
  const validSort = sortRaw && [...SORTS.map((s) => s.id), "relevance"].includes(sortRaw);
  const av = sp.get("availability");
  return {
    q,
    category: list(sp.get("category")),
    gender: list(sp.get("gender")),
    size: list(sp.get("size")),
    brand: list(sp.get("brand")),
    condition: list(sp.get("condition")),
    color: list(sp.get("color")),
    type: list(sp.get("type")),
    min: num(sp.get("min")),
    max: num(sp.get("max")),
    availability: av === "in-stock" || av === "sold" || av === "all" ? av : defaults.availability ?? "all",
    sort: (validSort ? sortRaw! : q ? "relevance" : defaults.sort ?? "featured"),
  };
}

export function serializeFilters(f: Partial<Filters>, defaults: Partial<Filters> = {}): string {
  const p = new URLSearchParams();
  const set = (k: string, v?: string | number | null) => { if (v !== undefined && v !== null && v !== "") p.set(k, String(v)); };
  set("q", f.q);
  (["category", "gender", "size", "brand", "condition", "color", "type"] as const).forEach((k) => { const v = f[k]; if (v && v.length) set(k, v.join(",")); });
  set("min", f.min); set("max", f.max);
  if (f.availability && f.availability !== (defaults.availability ?? "all")) set("availability", f.availability);
  const defSort = f.q ? "relevance" : defaults.sort ?? "featured";
  if (f.sort && f.sort !== defSort) set("sort", f.sort);
  return p.toString();
}

export function countActive(f: Filters, defaults: Partial<Filters> = {}): number {
  return (
    f.category.length + f.gender.length + f.size.length + f.brand.length + f.condition.length + f.color.length + f.type.length +
    (f.min !== null ? 1 : 0) + (f.max !== null ? 1 : 0) + (f.availability !== (defaults.availability ?? "all") ? 1 : 0)
  );
}

type Avail = (p: Product) => number;

export function filterProducts(all: Product[], f: Filters, avail: Avail, skip?: keyof Filters): Product[] {
  let pool = all;
  if (f.q && skip !== "q") pool = searchProducts(f.q, pool).map((h) => h.product);
  return pool.filter((p) => {
    if (skip !== "category" && f.category.length && !f.category.includes(p.category)) return false;
    if (skip !== "gender" && f.gender.length) {
      const ok = f.gender.some((g) => p.gender === g || (p.gender === "unisex" && (g === "men" || g === "women")));
      if (!ok) return false;
    }
    if (skip !== "size" && f.size.length && !f.size.includes(p.size)) return false;
    if (skip !== "brand" && f.brand.length && !f.brand.includes(p.brand)) return false;
    if (skip !== "condition" && f.condition.length && !f.condition.includes(p.condition)) return false;
    if (skip !== "color" && f.color.length && !f.color.includes(p.color)) return false;
    if (skip !== "type" && f.type.length && !f.type.includes(p.type)) return false;
    if (skip !== "min" && f.min !== null && p.price < f.min) return false;
    if (skip !== "max" && f.max !== null && p.price > f.max) return false;
    if (skip !== "availability") {
      const a = avail(p);
      if (f.availability === "in-stock" && a <= 0) return false;
      if (f.availability === "sold" && a > 0) return false;
    }
    return true;
  });
}

export function sortProducts(list: Product[], sort: SortId, avail: Avail, q: string): Product[] {
  const t = (p: Product) => +new Date(p.addedAt);
  const maxT = Math.max(...list.map(t), 0);
  const cutoff = maxT - 14 * 864e5;
  const featuredScore = (p: Product) => p.popularity + Math.max(0, 14 - (maxT - t(p)) / 864e5) * 2;
  const out = [...list];
  if (sort === "relevance" && q) {
    const order = new Map(searchProducts(q, list).map((h, i) => [h.product.id, i]));
    out.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  } else if (sort === "featured") out.sort((a, b) => featuredScore(b) - featuredScore(a));
  else if (sort === "newest") out.sort((a, b) => t(b) - t(a));
  else if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
  else if (sort === "popular") out.sort((a, b) => b.popularity - a.popularity);
  else if (sort === "recent")
    out.sort((a, b) => {
      const ra = t(a) >= cutoff ? 1 : 0, rb = t(b) >= cutoff ? 1 : 0;
      return rb - ra || (ra ? t(b) - t(a) : b.popularity - a.popularity);
    });
  // sold-out pairs always sink to the end
  return [...out.filter((p) => avail(p) > 0), ...out.filter((p) => avail(p) <= 0)];
}

export interface ActiveChip { key: keyof Filters; value?: string; label: string }
export function activeChips(f: Filters): ActiveChip[] {
  const chips: ActiveChip[] = [];
  f.category.forEach((v) => chips.push({ key: "category", value: v, label: categoryLabel(v) }));
  f.gender.forEach((v) => chips.push({ key: "gender", value: v, label: v[0].toUpperCase() + v.slice(1) }));
  f.size.forEach((v) => chips.push({ key: "size", value: v, label: `Size ${v}` }));
  f.brand.forEach((v) => chips.push({ key: "brand", value: v, label: v }));
  f.condition.forEach((v) => chips.push({ key: "condition", value: v, label: v.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));
  f.color.forEach((v) => chips.push({ key: "color", value: v, label: v }));
  f.type.forEach((v) => chips.push({ key: "type", value: v, label: v }));
  if (f.min !== null) chips.push({ key: "min", label: `From Rs ${f.min.toLocaleString()}` });
  if (f.max !== null) chips.push({ key: "max", label: `Up to Rs ${f.max.toLocaleString()}` });
  if (f.availability !== "all") chips.push({ key: "availability", label: f.availability === "in-stock" ? "In stock" : "Sold out" });
  return chips;
}

export type { Category, Condition };
