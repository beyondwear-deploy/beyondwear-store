import { getAllProducts, categoryLabel, comingSoonFor, isLive } from "./catalog";
import type { Product } from "./types";

/** Words customers use -> the category / gender / type they mean. */
const SYNONYMS: Record<string, string[]> = {
  shoe: ["shoes"], shoes: ["shoes"], sneaker: ["shoes"], sneakers: ["shoes"], trainer: ["shoes"], trainers: ["shoes"],
  kicks: ["shoes"], boot: ["shoes"], boots: ["shoes"],
  jacket: ["jackets"], jackets: ["jackets"], coat: ["jackets"], coats: ["jackets"], puffer: ["jackets"], bomber: ["jackets"], outerwear: ["jackets"],
  shirt: ["shirts"], shirts: ["shirts"], flannel: ["shirts"], oxford: ["shirts"],
  tee: ["t-shirts"], tees: ["t-shirts"], tshirt: ["t-shirts"], tshirts: ["t-shirts"], "t-shirt": ["t-shirts"], "t-shirts": ["t-shirts"], top: ["tops", "t-shirts"], tops: ["tops", "t-shirts"],
  hoodie: ["hoodies"], hoodies: ["hoodies"], hoody: ["hoodies"], sweatshirt: ["hoodies"], jumper: ["hoodies"],
  jean: ["jeans"], jeans: ["jeans"], denim: ["jeans", "jackets"], trouser: ["jeans"], trousers: ["jeans"], pants: ["jeans"],
  cap: ["caps"], caps: ["caps"], hat: ["caps"], hats: ["caps"],
  bag: ["bags"], bags: ["bags"], backpack: ["bags"], tote: ["bags"], handbag: ["bags"], crossbody: ["bags"],
  accessory: ["accessories"], accessories: ["accessories"], watch: ["accessories"], sunglasses: ["accessories"], belt: ["accessories"], shades: ["accessories"],
};
const GENDER_WORDS: Record<string, string> = {
  men: "men", mens: "men", man: "men", male: "men", gents: "men", boys: "kids",
  women: "women", womens: "women", woman: "women", ladies: "women", female: "women", girls: "women",
  kids: "kids", kid: "kids", child: "kids", children: "kids", junior: "kids",
};
const STOP = new Set(["the", "a", "an", "for", "and", "in", "of", "with", "size", "uk", "used", "preloved"]);

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/['’]/g, "");
export const tokenize = (q: string) =>
  norm(q).split(/[^a-z0-9\-]+/).filter((t) => t && !STOP.has(t));

/** True when a and b are within one edit (insert / delete / substitute / swap two neighbours). */
function within1(a: string, b: string): boolean {
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  if (la === lb) {
    const diff: number[] = [];
    for (let i = 0; i < la; i++) if (a[i] !== b[i]) { diff.push(i); if (diff.length > 2) return false; }
    if (diff.length <= 1) return true;
    return diff.length === 2 && diff[1] === diff[0] + 1 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]];
  }
  const [s, l] = la < lb ? [a, b] : [b, a];
  let i = 0;
  while (i < s.length && s[i] === l[i]) i++;
  return s.slice(i) === l.slice(i + 1);
}

const SYN_KEYS = Object.keys(SYNONYMS);
const GENDER_KEYS = Object.keys(GENDER_WORDS);
/** Closest known keyword for a misspelt token ("snaekers" -> "sneakers"), or "" when nothing is close. */
const fuzzyKey = (t: string, keys: string[]) => (t.length >= 4 ? keys.find((k) => k.length >= 4 && within1(t, k)) ?? "" : "");

function fieldScore(token: string, hay: string[], weight: number): number {
  for (const h of hay) {
    if (h === token) return weight;
    if (h.startsWith(token)) return weight * 0.8;
    if (token.length >= 3 && h.includes(token)) return weight * 0.55;
    if (token.length >= 4 && h.split(/[\s\-\/]+/).some((w) => w.length >= 4 && within1(token, w))) return weight * 0.4;
  }
  return 0;
}

export interface SearchHit { product: Product; score: number }

export function searchProducts(query: string, pool: Product[] = getAllProducts()): SearchHit[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const hits: SearchHit[] = [];
  for (const p of pool) {
    const brand = [norm(p.brand)];
    const name = [norm(p.name), ...norm(p.name).split(/\s+/)];
    const cat = [p.category, norm(categoryLabel(p.category))];
    const type = [norm(p.type), ...norm(p.type).split(/\s+/)];
    const color = [norm(p.color), ...norm(p.color).split(/[\s\/]+/)];
    const gender = [p.gender, ...(p.gender === "unisex" ? ["men", "women"] : [])];
    const extra = p.keywords.map(norm);
    const desc = [norm(p.description), norm(p.material), norm(p.size)];
    let total = 0;
    let ok = true;
    for (const t of tokens) {
      let s = 0;
      s = Math.max(s, fieldScore(t, brand, 9), fieldScore(t, name, 8), fieldScore(t, type, 6), fieldScore(t, color, 6), fieldScore(t, extra, 3), fieldScore(t, desc, 1.5));
      const gw = GENDER_WORDS[t] ?? GENDER_WORDS[fuzzyKey(t, GENDER_KEYS)];
      if (gw && gender.includes(gw)) s = Math.max(s, 5);
      const syn = SYNONYMS[t] ?? SYNONYMS[fuzzyKey(t, SYN_KEYS)];
      if (syn && syn.includes(p.category)) s = Math.max(s, 7);
      // size tokens like "9", "m", "32"
      if (norm(p.size).replace(/^uk\s*/, "") === t) s = Math.max(s, 6);
      if (s === 0) { ok = false; break; }
      total += s;
    }
    if (!ok) continue;
    total += p.stock > 0 ? 1 : -2; // sold items sink
    total += p.popularity / 100;
    hits.push({ product: p, score: total });
  }
  return hits.sort((a, b) => b.score - a.score);
}

export interface Suggestion { kind: "product" | "brand" | "category"; label: string; href: string; hint?: string }

export function getSuggestions(query: string, limit = 6): Suggestion[] {
  const q = norm(query).trim();
  if (!q) return [];
  const all = getAllProducts();
  const out: Suggestion[] = [];
  const brands = Array.from(new Set(all.map((p) => p.brand)));
  brands.filter((b) => norm(b).startsWith(q) || norm(b).includes(q)).slice(0, 2).forEach((b) =>
    out.push({ kind: "brand", label: b, href: `/shop?brand=${encodeURIComponent(b)}`, hint: "Brand" }));
  const cats = Array.from(new Set(all.map((p) => p.category)));
  cats.filter((c) => norm(categoryLabel(c)).startsWith(q)).slice(0, 2).forEach((c) =>
    out.push({ kind: "category", label: categoryLabel(c), href: `/shop?category=${c}`, hint: "Category" }));
  searchProducts(q, all).slice(0, limit).forEach((h) =>
    out.push({ kind: "product", label: `${h.product.brand} ${h.product.name}`, href: `/product/${h.product.slug}`, hint: h.product.size }));
  return out.slice(0, limit + 2);
}

export const POPULAR_SEARCHES = ["Black Nike shoes", "Air Max", "Adidas Samba", "Boots", "Running shoes", "Kids sneakers", "New Balance"];

/** If the query is about a category that is not live yet (e.g. "denim jacket"), returns its coming-soon group. */
export function comingSoonMatch(query: string) {
  for (const t of tokenize(query)) {
    const syn = SYNONYMS[t] ?? SYNONYMS[fuzzyKey(t, SYN_KEYS)];
    if (!syn || syn.some(isLive)) continue;
    const g = comingSoonFor(syn[0]);
    if (g) return g;
  }
  return undefined;
}
