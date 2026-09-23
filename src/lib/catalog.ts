/**
 * CATALOG ACCESS LAYER
 * All reads go through these functions. To connect Supabase, re-implement them
 * as async queries (the shapes already match supabase/schema.sql) — no
 * component needs to change beyond awaiting the calls in server components.
 */
import { PRODUCTS } from "@/data/products";
import { siteConfig } from "./config";
import type { Category, Gender, Product } from "./types";

/**
 * LAUNCH SWITCH — categories that are live in the shop right now.
 * Sequel Closet starts with shoes only. Products in other categories stay in
 * data/products.ts but are hidden everywhere (shop, search, sitemap, product
 * URLs) and shown as "Coming soon". To launch a category, add its id here.
 */
export const LIVE_CATEGORIES: Category[] = ["shoes"];
export const isLive = (c: string) => (LIVE_CATEGORIES as string[]).includes(c);
const isSellable = (p: Product) => p.status === "active" && isLive(p.category);

export const getAllProducts = (): Product[] => PRODUCTS.filter(isSellable);
export const getProductBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug && isSellable(p));
export const getProductById = (id: string) => PRODUCTS.find((p) => p.id === id && isSellable(p));

export const CATEGORIES: { id: Category; label: string; plural: string; blurb: string }[] = [
  { id: "shoes", label: "Shoes", plural: "Shoes", blurb: "Sneakers, boots & everyday pairs" },
  { id: "jackets", label: "Jackets", plural: "Jackets", blurb: "Denim, bombers, puffers & outerwear" },
  { id: "shirts", label: "Shirts", plural: "Shirts", blurb: "Oxfords, linen, flannel & more" },
  { id: "t-shirts", label: "T-Shirts", plural: "T-Shirts", blurb: "Heavy cotton basics & graphics" },
  { id: "tops", label: "Tops", plural: "Tops", blurb: "Knits, tees & easy layers" },
  { id: "hoodies", label: "Hoodies", plural: "Hoodies", blurb: "Fleece, zip-ups & pullovers" },
  { id: "jeans", label: "Jeans & Trousers", plural: "Jeans & Trousers", blurb: "Denim with character" },
  { id: "caps", label: "Caps", plural: "Caps", blurb: "Structured & relaxed caps" },
  { id: "bags", label: "Bags", plural: "Bags", blurb: "Totes, crossbody & backpacks" },
  { id: "accessories", label: "Accessories", plural: "Accessories", blurb: "Watches, belts & eyewear" },
];
export const categoryLabel = (c: string) => CATEGORIES.find((x) => x.id === c)?.label ?? c;

/** Groups shown as "Coming soon" while their categories are not live. */
export const COMING_SOON: { id: string; label: string; blurb: string; icon: "outerwear" | "clothing" | "bags"; categories: Category[] }[] = [
  { id: "outerwear", label: "Jackets & Outerwear", blurb: "Denim, bombers and puffers", icon: "outerwear", categories: ["jackets"] },
  { id: "clothing", label: "Clothing", blurb: "Shirts, tees, hoodies and jeans", icon: "clothing", categories: ["shirts", "t-shirts", "tops", "hoodies", "jeans"] },
  { id: "bags", label: "Bags & Accessories", blurb: "Backpacks, caps, watches and eyewear", icon: "bags", categories: ["bags", "caps", "accessories"] },
];
/** The coming-soon group a category belongs to, or undefined when the category is live / unknown. */
export const comingSoonFor = (category: string) => (isLive(category) ? undefined : COMING_SOON.find((g) => (g.categories as string[]).includes(category)));

export const GENDERS: { id: Gender; label: string }[] = [
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "kids", label: "Kids" },
  { id: "unisex", label: "Unisex" },
];

/** Copy for each department landing page (all live departments are shoes for now). */
export const DEPARTMENTS: Record<"men" | "women" | "kids", { label: string; headline: string; blurb: string }> = {
  men: {
    label: "Men",
    headline: "Men's shoes, next chapter.",
    blurb: "Sneakers, boots and everyday pairs — inspected, honestly graded and photographed in detail.",
  },
  women: {
    label: "Women",
    headline: "Women's shoes, second act.",
    blurb: "Clean, wearable pairs from brands you know — every mark disclosed, every size measured.",
  },
  kids: {
    label: "Kids",
    headline: "Kids' shoes, gently used.",
    blurb: "Kids outgrow shoes long before they wear them out. Quality pairs, a second chapter, friendlier prices.",
  },
};

/** Which products belong to a department (unisex items appear in Men & Women). */
export function forDepartment(dept: "men" | "women" | "kids", list: Product[] = getAllProducts()): Product[] {
  if (dept === "kids") return list.filter((p) => p.gender === "kids");
  return list.filter((p) => p.gender === dept || p.gender === "unisex");
}

export function daysSinceAdded(p: Product): number {
  const now = siteConfig.demoMode ? new Date(siteConfig.catalogReferenceDate).getTime() : Date.now();
  return (now - new Date(p.addedAt).getTime()) / 86400000;
}
export const isJustIn = (p: Product) => daysSinceAdded(p) <= 4;

export const newest = (list: Product[]) => [...list].sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt));
export const popular = (list: Product[]) => [...list].sort((a, b) => b.popularity - a.popularity);

export function relatedProducts(p: Product, n = 4): Product[] {
  return getAllProducts()
    .filter((x) => x.id !== p.id)
    .map((x) => ({
      x,
      score:
        (x.category === p.category ? 4 : 0) +
        (x.gender === p.gender ? 3 : 0) +
        (x.brand === p.brand ? 2 : 0) +
        (x.stock > 0 ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.x.popularity - a.x.popularity)
    .slice(0, n)
    .map((s) => s.x);
}

export const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

export function getFacets(list: Product[] = getAllProducts()) {
  const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
  const colors = new Map<string, string>();
  list.forEach((p) => colors.set(p.color, p.colorHex));
  return {
    brands: uniq(list.map((p) => p.brand)).sort(),
    sizes: sortSizes(uniq(list.map((p) => p.size))),
    types: uniq(list.map((p) => p.type)).sort(),
    colors: Array.from(colors.entries()).map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name)),
    minPrice: Math.min(...list.map((p) => p.price)),
    maxPrice: Math.max(...list.map((p) => p.price)),
  };
}
