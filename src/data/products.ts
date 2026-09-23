/**
 * DEMO CATALOGUE
 * ---------------------------------------------------------------------------
 * Realistic sample products so the store is fully usable out of the box.
 * Only categories listed in LIVE_CATEGORIES (lib/catalog.ts — currently shoes)
 * are shown on the site; the other demo rows stay here for when they launch.
 * Images are generated studio art (see components/art) until you upload real
 * photography — set `images[].src` per product (or load from Supabase) and the
 * generated art is bypassed automatically.
 *
 * In production, replace `getAllProducts()` in lib/catalog.ts with a Supabase
 * query; the `Product` type maps 1:1 to the `products` table in supabase/schema.sql.
 */
import { siteConfig } from "@/lib/config";
import { slugify } from "@/lib/format";
import type {
  ArtSpec,
  Category,
  Condition,
  Gender,
  GarmentKey,
  ImageView,
  Measurement,
  Product,
  ProductImage,
} from "@/lib/types";

interface Row {
  b: string; // brand
  n: string; // name (without brand)
  cat: Category;
  g: Gender;
  t: string; // product type
  s: string; // size
  col: string; // colour name
  hex: string;
  hex2: string;
  cond: Condition;
  p: number;
  o?: number;
  art: GarmentKey;
  v?: number;
  fab?: ArtSpec["fabric"];
  mat: string;
  d: number; // days ago listed
  pop: number;
  stock?: number;
  mark?: string;
  notes?: string[];
  wear?: string;
}

/* ------------------------------------------------------------------ */
/* Measurement + copy generators                                       */
/* ------------------------------------------------------------------ */

const TOP_SIZES: Record<string, [number, number, number, number]> = {
  XS: [18.5, 25.5, 16, 23.5],
  S: [19.5, 26.5, 17, 24.5],
  M: [21, 27.5, 18, 25.5],
  L: [22.5, 28.5, 19, 26],
  XL: [24, 29.5, 20, 26.5],
};
const KIDS_TOP: Record<string, [number, number, number, number]> = {
  "5-6Y": [14, 18.5, 12.5, 16],
  "6-7Y": [14.5, 19.5, 13, 17.5],
  "7-8Y": [15.5, 20.5, 13.5, 18.5],
  "8-9Y": [16.5, 21.5, 14, 19.5],
  "9-10Y": [17, 22.5, 14.5, 20.5],
  "10-11Y": [18, 23.5, 15, 21.5],
};

function measurementsFor(r: Row): Measurement[] {
  const inch = (n: number) => `${n}"`;
  const g = r.art;
  if (["tee", "shirt", "hoodie", "trucker", "bomber", "puffer"].includes(g)) {
    const base = (r.g === "kids" ? KIDS_TOP[r.s] : TOP_SIZES[r.s]) ?? TOP_SIZES.M;
    const womenAdj = r.g === "women" ? -1 : 0;
    const [chest, len, sh, sl] = base;
    const short = g === "tee";
    return [
      { label: "Chest (pit to pit)", value: inch(chest + womenAdj) },
      { label: "Length", value: inch(len + (r.g === "women" ? -1 : 0)) },
      { label: "Shoulder", value: inch(sh + womenAdj * 0.5) },
      { label: "Sleeve", value: inch(short ? Math.round((sl - 17) * 2) / 2 + 1 : sl) },
    ];
  }
  if (g === "jeans") {
    const w = parseInt(r.s, 10) || 32;
    return [
      { label: "Waist (flat)", value: inch(+(w / 2 + 0.5).toFixed(1)) },
      { label: "Front rise", value: inch(r.g === "women" ? 11.5 : 10.5) },
      { label: "Inseam", value: inch(r.g === "women" ? 28 : 31) },
      { label: "Leg opening", value: inch(r.col.toLowerCase().includes("wide") ? 10 : 8) },
    ];
  }
  if (g === "sneaker" || g === "boot") {
    const uk = parseFloat(r.s.replace(/[^0-9.]/g, "")) || 8;
    const len = +(9.25 + 0.33 * (uk - 4)).toFixed(1);
    const list: Measurement[] = [
      { label: "Insole length", value: inch(len) },
      { label: "Width (ball)", value: inch(+(3.4 + 0.06 * uk).toFixed(1)) },
      { label: "Heel to top of upper", value: inch(g === "boot" ? 6.5 : 3.5) },
    ];
    return list;
  }
  if (g === "cap")
    return [
      { label: "Circumference", value: `${r.g === "kids" ? "20–21.5" : "22–24"}"` },
      { label: "Brim length", value: inch(r.g === "kids" ? 2.5 : 2.75) },
      { label: "Crown height", value: inch(r.g === "kids" ? 3.5 : 4) },
    ];
  if (g === "cross") return [{ label: "Width", value: inch(9.5) }, { label: "Height", value: inch(7) }, { label: "Depth", value: inch(3) }, { label: "Strap drop", value: inch(22) }];
  if (g === "tote") return [{ label: "Width", value: inch(15) }, { label: "Height", value: inch(14) }, { label: "Depth", value: inch(5) }, { label: "Handle drop", value: inch(9) }];
  if (g === "pack")
    return [
      { label: "Width", value: inch(r.g === "kids" ? 9 : 11.5) },
      { label: "Height", value: inch(r.g === "kids" ? 12.5 : 17) },
      { label: "Depth", value: inch(r.g === "kids" ? 4.5 : 6) },
    ];
  if (g === "sunglasses") return [{ label: "Lens width", value: inch(2) }, { label: "Bridge", value: inch(0.7) }, { label: "Temple length", value: inch(5.5) }];
  if (g === "watch") return [{ label: "Case diameter", value: inch(1.6) }, { label: "Strap width", value: inch(0.8) }, { label: "Fits wrist", value: `6–8"` }];
  if (g === "belt") return [{ label: "Total length", value: inch(parseInt(r.s, 10) + 6 || 40) }, { label: "Width", value: inch(1.25) }, { label: "Fits waist", value: `${parseInt(r.s, 10) - 2 || 32}–${parseInt(r.s, 10) || 34}"` }];
  return [];
}

const KIND: Record<GarmentKey, "apparel" | "shoes" | "bag" | "acc"> = {
  tee: "apparel", shirt: "apparel", hoodie: "apparel", trucker: "apparel", bomber: "apparel", puffer: "apparel", jeans: "apparel",
  sneaker: "shoes", boot: "shoes",
  tote: "bag", cross: "bag", pack: "bag",
  cap: "acc", sunglasses: "acc", belt: "acc", watch: "acc",
};

const NOTES: Record<"apparel" | "shoes" | "bag" | "acc", Record<Condition, string[]>> = {
  apparel: {
    new: ["Unworn — never washed or worn", "No marks, odours or loose threads"],
    "like-new": ["Worn once or twice at most", "No fading, pilling or stains", "Seams, cuffs and collar fully intact"],
    excellent: ["Very light softening of fabric from washing", "No stains, holes or repairs", "Shape and fit fully retained"],
    good: ["Light fading along seams and hems", "Minor pilling in high-friction areas", "No holes or tears — fully wearable"],
    fair: ["Visible fading and general wear throughout", "Some pilling and softened cuffs/hem", "Structurally sound — priced to reflect wear"],
  },
  shoes: {
    new: ["Unworn, original box condition", "Clean soles with no wear"],
    "like-new": ["Worn once or twice indoors", "Sole tread essentially unworn", "No creasing beyond first-wear softness"],
    excellent: ["Light creasing across the toe box", "Sole shows very minor wear", "Clean interior, no odour"],
    good: ["Visible creasing and light scuffing", "Moderate sole wear, plenty of life left", "Interior lining clean and intact"],
    fair: ["Noticeable scuffing and creasing", "Sole worn but still supportive", "Cleaned and deodorised — fully wearable"],
  },
  bag: {
    new: ["Unused, original packaging condition", "Hardware and lining pristine"],
    "like-new": ["Carried lightly, almost no signs of use", "Lining clean, hardware unmarked"],
    excellent: ["Very light corner softening", "Hardware with faint surface marks only", "Lining clean, zips smooth"],
    good: ["Visible edge wear at corners", "Light marks on strap or base", "All zips and fastenings working"],
    fair: ["Noticeable rubbing at corners and base", "Surface marks on body and strap", "Fully functional, priced to reflect wear"],
  },
  acc: {
    new: ["Unused — as originally supplied"],
    "like-new": ["Barely used, no visible marks"],
    excellent: ["Very minor surface marks only", "Fully functional, nothing to disclose beyond this"],
    good: ["Light surface scratches and softening", "Fully functional"],
    fair: ["Visible wear and marks", "Fully functional — priced to reflect wear"],
  },
};

const WEAR: Record<"apparel" | "shoes" | "bag" | "acc", Record<Condition, string>> = {
  apparel: { new: "No wear", "like-new": "No visible wear", excellent: "Faint collar softening", good: "Light hem fading", fair: "Visible hem wear" },
  shoes: { new: "Clean sole", "like-new": "Clean sole", excellent: "Light toe creasing", good: "Sole wear, heel", fair: "Scuffing, sole wear" },
  bag: { new: "No wear", "like-new": "No visible wear", excellent: "Faint corner rub", good: "Corner edge wear", fair: "Corner rubbing" },
  acc: { new: "No wear", "like-new": "No visible wear", excellent: "Faint surface mark", good: "Light scratches", fair: "Surface wear" },
};

const FLAVOUR: Record<GarmentKey, string> = {
  tee: "A wardrobe staple in soft, substantial cotton with a clean neckline that keeps its shape.",
  shirt: "Crisp, easy to layer and dress up or down — a shirt that earns its place in rotation.",
  hoodie: "Heavyweight, brushed-back fleece with a roomy hood and a properly cosy hand-feel.",
  trucker: "A structured, seasoned layer with hard-wearing seams that only look better with age.",
  bomber: "A sleek, lightweight layer with ribbed trims and a clean, easy shape.",
  puffer: "Warm, lofty insulation with a wind-proof shell — built for real winter days.",
  jeans: "Well-cut denim with character from previous wear and plenty of life left in it.",
  sneaker: "A proper everyday sneaker with a supportive sole and a silhouette that goes with everything.",
  boot: "Rugged, well-built boots that break in beautifully and keep their structure.",
  cap: "A clean, structured crown with a curved brim and an adjustable fit.",
  tote: "Roomy and unfussy — sturdy handles and a base that holds its shape.",
  cross: "A compact everyday bag with a secure flap closure and an adjustable strap.",
  pack: "A hard-working backpack with padded straps and organised compartments.",
  sunglasses: "A classic frame with clear, scratch-checked lenses and solid hinges.",
  belt: "A supple belt with sturdy stitching and a solid buckle.",
  watch: "A dependable everyday watch with a clean dial. Tested and running when listed.",
};

const CAT_CODE: Record<Category, string> = {
  shoes: "SHO", jackets: "JKT", shirts: "SHT", "t-shirts": "TEE", tops: "TOP", hoodies: "HOO", jeans: "JNS", caps: "CAP", bags: "BAG", accessories: "ACC",
};

function viewsFor(kind: "apparel" | "shoes" | "bag" | "acc", garment: GarmentKey): ImageView[] {
  if (kind === "shoes") return ["side", "back", "detail", "label", "wear"];
  if (kind === "apparel") return ["front", "back", "detail", "label", "wear"];
  if (garment === "cap") return ["front", "detail", "label", "wear"];
  return ["front", "detail", "label", "wear"];
}

const VIEW_LABEL: Record<ImageView, string> = {
  front: "front view",
  back: "back view",
  side: "side view",
  detail: "fabric and construction close-up",
  label: "brand and size label",
  wear: "wear detail",
};

/* ------------------------------------------------------------------ */
/* Catalogue rows                                                      */
/* ------------------------------------------------------------------ */

const C = {
  black: "#1c1b19", charcoal: "#3d3c39", grey: "#a19e96", white: "#eeeae0", cream: "#e4d9c1", sand: "#cdb99a",
  olive: "#5b6040", sage: "#9dad93", forest: "#2f4a3a", navy: "#1f2b46", sky: "#a9c1da", denim: "#4d6a8f",
  denimL: "#8fb0cf", denimD: "#27374f", washedBlack: "#3a3b3d", brown: "#6a4a32", tan: "#b3835a", wheat: "#c9a26a",
  red: "#a63a2b", oxblood: "#5b1f24", rust: "#b1541f", dusty: "#d7a9a0", pink: "#e8b7c0", cherry: "#7b1d2b",
  blue: "#3d6fb0", mustard: "#d0a02c", teal: "#2d7f7a", coral: "#e0765a", ivory: "#f0e9d8",
};

const ROWS: Row[] = [
  /* ---------------- MEN ---------------- */
  { b: "Nike", n: "Air Max Trainers", cat: "shoes", g: "men", t: "Sneakers", s: "UK 9", col: "Black", hex: C.black, hex2: C.grey, cond: "excellent", p: 14500, o: 34000, art: "sneaker", mat: "Leather & mesh upper, rubber sole", d: 1, pop: 98 },
  { b: "Adidas", n: "Samba Low Sneakers", cat: "shoes", g: "men", t: "Sneakers", s: "UK 8", col: "Cream", hex: C.cream, hex2: C.charcoal, cond: "like-new", p: 12800, o: 27000, art: "sneaker", v: 1, mat: "Leather & suede, gum rubber sole", d: 2, pop: 94 },
  { b: "New Balance", n: "550 Court Sneakers", cat: "shoes", g: "men", t: "Sneakers", s: "UK 10", col: "White", hex: C.white, hex2: C.forest, cond: "good", p: 11500, o: 30000, art: "sneaker", v: 2, mat: "Leather upper, rubber cupsole", d: 9, pop: 88 },
  { b: "Vans", n: "Old Skool Skate Shoes", cat: "shoes", g: "men", t: "Skate shoes", s: "UK 9", col: "Black", hex: C.charcoal, hex2: C.white, cond: "good", p: 6500, o: 16000, art: "sneaker", v: 3, mat: "Suede & canvas, waffle rubber sole", d: 14, pop: 75 },
  { b: "Converse", n: "Chuck 70 High Tops", cat: "shoes", g: "unisex", t: "High-top sneakers", s: "UK 8", col: "Off-white", hex: C.ivory, hex2: C.red, cond: "excellent", p: 7800, o: 18000, art: "sneaker", v: 4, mat: "Heavy canvas, vulcanised rubber sole", d: 5, pop: 81 },
  { b: "Timberland", n: "6-Inch Leather Boots", cat: "shoes", g: "men", t: "Boots", s: "UK 9", col: "Wheat", hex: C.wheat, hex2: C.brown, cond: "good", p: 16500, o: 42000, art: "boot", mat: "Waterproof nubuck leather", d: 20, pop: 90, stock: 0 },
  { b: "Levi's", n: "Trucker Denim Jacket", cat: "jackets", g: "men", t: "Denim jacket", s: "M", col: "Washed Indigo", hex: C.denim, hex2: C.sand, cond: "excellent", p: 8900, o: 24000, art: "trucker", fab: "denim", mat: "100% cotton denim", d: 3, pop: 96 },
  { b: "Carhartt", n: "Detroit Work Jacket", cat: "jackets", g: "men", t: "Work jacket", s: "L", col: "Brown", hex: C.brown, hex2: C.tan, cond: "good", p: 14900, o: 38000, art: "trucker", v: 1, fab: "canvas", mat: "Duck canvas, blanket lining", d: 11, pop: 86 },
  { b: "Zara", n: "Bomber Jacket", cat: "jackets", g: "men", t: "Bomber jacket", s: "M", col: "Olive", hex: C.olive, hex2: C.black, cond: "like-new", p: 7200, o: 16500, art: "bomber", fab: "plain", mat: "Polyester shell, ribbed trims", d: 4, pop: 84 },
  { b: "The North Face", n: "Baffled Puffer Jacket", cat: "jackets", g: "men", t: "Puffer jacket", s: "L", col: "Black", hex: C.black, hex2: C.grey, cond: "excellent", p: 21500, o: 55000, art: "puffer", mat: "Nylon shell, down-blend fill", d: 6, pop: 92 },
  { b: "Ralph Lauren", n: "Oxford Button-Down Shirt", cat: "shirts", g: "men", t: "Oxford shirt", s: "M", col: "Sky Blue", hex: C.sky, hex2: C.navy, cond: "excellent", p: 4800, o: 14000, art: "shirt", mat: "100% cotton oxford", d: 7, pop: 78 },
  { b: "Uniqlo", n: "Linen Casual Shirt", cat: "shirts", g: "men", t: "Linen shirt", s: "L", col: "Sand", hex: C.sand, hex2: C.brown, cond: "like-new", p: 3200, o: 7500, art: "shirt", v: 1, mat: "100% linen", d: 2, pop: 72 },
  { b: "Tommy Hilfiger", n: "Check Flannel Shirt", cat: "shirts", g: "men", t: "Flannel shirt", s: "L", col: "Red / Navy", hex: C.red, hex2: C.navy, cond: "good", p: 3400, o: 11000, art: "shirt", v: 2, mat: "Brushed cotton flannel", d: 16, pop: 66 },
  { b: "Zara", n: "Camp Collar Shirt", cat: "shirts", g: "men", t: "Camp shirt", s: "M", col: "Olive", hex: "#6a7050", hex2: C.cream, cond: "new", p: 3600, o: 8500, art: "shirt", v: 3, mat: "Viscose blend", d: 1, pop: 70 },
  { b: "Nike", n: "Essential Logo Tee", cat: "t-shirts", g: "men", t: "T-shirt", s: "M", col: "White", hex: C.white, hex2: C.black, cond: "excellent", p: 2400, o: 6000, art: "tee", v: 1, mark: "ESSENTIAL", mat: "100% cotton jersey", d: 5, pop: 68 },
  { b: "Champion", n: "Heavyweight Tee", cat: "t-shirts", g: "men", t: "T-shirt", s: "L", col: "Heather Grey", hex: C.grey, hex2: C.navy, cond: "good", p: 2200, o: 5500, art: "tee", v: 2, mat: "Heavy cotton jersey", d: 13, pop: 64 },
  { b: "Carhartt", n: "Pocket Tee", cat: "t-shirts", g: "men", t: "T-shirt", s: "L", col: "Charcoal", hex: C.charcoal, hex2: C.tan, cond: "like-new", p: 3100, o: 7500, art: "tee", v: 3, mat: "100% cotton jersey", d: 8, pop: 74 },
  { b: "Uniqlo", n: "Oversized Cotton Tee", cat: "t-shirts", g: "men", t: "T-shirt", s: "XL", col: "Black", hex: C.black, hex2: C.grey, cond: "new", p: 2000, o: 4500, art: "tee", mat: "Supima cotton", d: 1, pop: 79, stock: 2 },
  { b: "Nike", n: "Tech Fleece Hoodie", cat: "hoodies", g: "men", t: "Hoodie", s: "L", col: "Charcoal", hex: C.charcoal, hex2: C.grey, cond: "excellent", p: 7900, o: 22000, art: "hoodie", mat: "Cotton-poly fleece", d: 3, pop: 91 },
  { b: "Champion", n: "Reverse Weave Hoodie", cat: "hoodies", g: "men", t: "Hoodie", s: "M", col: "Navy", hex: C.navy, hex2: C.cream, cond: "good", p: 5200, o: 14000, art: "hoodie", v: 1, mark: "CHAMPION", mat: "Heavy cotton fleece", d: 12, pop: 77 },
  { b: "Adidas", n: "Essentials Hoodie", cat: "hoodies", g: "men", t: "Hoodie", s: "XL", col: "Black", hex: C.black, hex2: C.white, cond: "like-new", p: 6400, o: 15500, art: "hoodie", v: 2, mat: "Cotton-blend fleece", d: 4, pop: 80 },
  { b: "Levi's", n: "Original Straight Jeans", cat: "jeans", g: "men", t: "Jeans", s: "32", col: "Mid Indigo", hex: C.denim, hex2: C.sand, cond: "good", p: 5400, o: 15000, art: "jeans", fab: "denim", mat: "100% cotton denim", d: 6, pop: 89 },
  { b: "Zara", n: "Relaxed Fit Jeans", cat: "jeans", g: "men", t: "Jeans", s: "34", col: "Washed Black", hex: C.washedBlack, hex2: C.grey, cond: "excellent", p: 3900, o: 9000, art: "jeans", v: 1, fab: "denim", mat: "Cotton-elastane denim", d: 9, pop: 73 },
  { b: "Wrangler", n: "Straight Fit Denim", cat: "jeans", g: "men", t: "Jeans", s: "33", col: "Light Wash", hex: C.denimL, hex2: C.sand, cond: "fair", p: 2800, o: 8500, art: "jeans", v: 2, fab: "denim", mat: "100% cotton denim", d: 18, pop: 55 },
  { b: "New Era", n: "Structured Baseball Cap", cat: "caps", g: "men", t: "Cap", s: "One size", col: "Navy", hex: C.navy, hex2: C.white, cond: "excellent", p: 2600, o: 6500, art: "cap", mark: "NE", mat: "Wool-blend crown", d: 5, pop: 71 },
  { b: "Nike", n: "Heritage Cap", cat: "caps", g: "unisex", t: "Cap", s: "One size", col: "Black", hex: C.black, hex2: C.grey, cond: "like-new", p: 2100, o: 5000, art: "cap", v: 1, mat: "Cotton twill", d: 2, pop: 69 },
  { b: "Champion", n: "Script Cap", cat: "caps", g: "unisex", t: "Cap", s: "One size", col: "Sage", hex: C.sage, hex2: C.navy, cond: "good", p: 1600, o: 4000, art: "cap", v: 2, mat: "Cotton twill", d: 15, pop: 52 },
  { b: "Ray-Ban", n: "Classic Acetate Sunglasses", cat: "accessories", g: "unisex", t: "Sunglasses", s: "One size", col: "Black", hex: C.black, hex2: C.grey, cond: "excellent", p: 9800, o: 24000, art: "sunglasses", mat: "Acetate frame, glass lenses", d: 7, pop: 87 },
  { b: "Fossil", n: "Leather Strap Watch", cat: "accessories", g: "men", t: "Watch", s: "One size", col: "Tan", hex: C.tan, hex2: C.cream, cond: "good", p: 7800, o: 20000, art: "watch", mat: "Steel case, leather strap", d: 10, pop: 76 },
  { b: "Levi's", n: "Reversible Leather Belt", cat: "accessories", g: "men", t: "Belt", s: "34", col: "Brown", hex: C.brown, hex2: C.black, cond: "excellent", p: 2400, o: 6000, art: "belt", mat: "Genuine leather", d: 3, pop: 58 },
  /* ---------------- UNISEX BAGS ---------------- */
  { b: "Herschel", n: "Classic Backpack", cat: "bags", g: "unisex", t: "Backpack", s: "One size", col: "Navy", hex: C.navy, hex2: C.tan, cond: "good", p: 6200, o: 15500, art: "pack", mat: "Recycled polyester, cotton-canvas lining", d: 8, pop: 82 },
  /* ---------------- WOMEN ---------------- */
  { b: "Coach", n: "Leather Crossbody Bag", cat: "bags", g: "women", t: "Crossbody bag", s: "One size", col: "Tan", hex: C.tan, hex2: C.cream, cond: "excellent", p: 18500, o: 52000, art: "cross", fab: "leather", mat: "Pebbled leather, brass-tone hardware", d: 22, pop: 93, stock: 0 },
  { b: "Zara", n: "Canvas Tote Bag", cat: "bags", g: "women", t: "Tote bag", s: "One size", col: "Ecru", hex: C.ivory, hex2: C.brown, cond: "like-new", p: 2800, o: 6500, art: "tote", fab: "canvas", mat: "Heavy cotton canvas", d: 2, pop: 65 },
  { b: "Michael Kors", n: "Zip Crossbody Bag", cat: "bags", g: "women", t: "Crossbody bag", s: "One size", col: "Oxblood", hex: C.oxblood, hex2: C.wheat, cond: "good", p: 12500, o: 34000, art: "cross", v: 1, fab: "leather", mat: "Saffiano-style leather", d: 5, pop: 85 },
  { b: "Zara", n: "Cropped Denim Jacket", cat: "jackets", g: "women", t: "Denim jacket", s: "S", col: "Light Blue", hex: C.denimL, hex2: C.sand, cond: "like-new", p: 5900, o: 13000, art: "trucker", v: 2, fab: "denim", mat: "100% cotton denim", d: 3, pop: 83 },
  { b: "H&M", n: "Faux Leather Jacket", cat: "jackets", g: "women", t: "Biker jacket", s: "M", col: "Black", hex: C.black, hex2: C.grey, cond: "excellent", p: 5600, o: 14500, art: "bomber", v: 1, fab: "leather", mat: "Polyurethane faux leather, polyester lining", d: 6, pop: 79 },
  { b: "Mango", n: "Padded Jacket", cat: "jackets", g: "women", t: "Puffer jacket", s: "S", col: "Sand", hex: C.sand, hex2: C.brown, cond: "good", p: 7400, o: 19000, art: "puffer", v: 1, mat: "Nylon shell, polyester fill", d: 12, pop: 74 },
  { b: "Zara", n: "Satin Shirt", cat: "shirts", g: "women", t: "Satin shirt", s: "S", col: "Ivory", hex: C.ivory, hex2: C.sand, cond: "excellent", p: 3400, o: 8500, art: "shirt", v: 4, mat: "Satin-finish polyester", d: 4, pop: 76 },
  { b: "H&M", n: "Linen-Blend Shirt", cat: "shirts", g: "women", t: "Linen-blend shirt", s: "M", col: "Sage", hex: C.sage, hex2: C.cream, cond: "like-new", p: 2600, o: 5500, art: "shirt", v: 1, mat: "Linen-cotton blend", d: 1, pop: 67 },
  { b: "Mango", n: "Ribbed Knit Top", cat: "tops", g: "women", t: "Knit top", s: "S", col: "Black", hex: C.black, hex2: C.grey, cond: "excellent", p: 2200, o: 5000, art: "tee", v: 4, fab: "knit", mat: "Ribbed cotton-viscose", d: 7, pop: 62 },
  { b: "Uniqlo", n: "Cotton Crew Tee", cat: "tops", g: "women", t: "Cotton tee", s: "M", col: "White", hex: C.white, hex2: C.grey, cond: "new", p: 1800, o: 3900, art: "tee", mat: "100% cotton", d: 2, pop: 60 },
  { b: "Nike", n: "Fleece Cropped Hoodie", cat: "hoodies", g: "women", t: "Cropped hoodie", s: "S", col: "Dusty Pink", hex: C.dusty, hex2: C.cream, cond: "excellent", p: 5800, o: 14500, art: "hoodie", v: 3, mat: "Cotton-poly fleece", d: 5, pop: 81 },
  { b: "Adidas", n: "Zip Hoodie", cat: "hoodies", g: "women", t: "Zip hoodie", s: "M", col: "Sage", hex: C.sage, hex2: C.white, cond: "good", p: 4600, o: 12500, art: "hoodie", v: 4, mat: "Cotton-blend fleece", d: 15, pop: 63 },
  { b: "Adidas", n: "Suede Trainers", cat: "shoes", g: "women", t: "Sneakers", s: "UK 5", col: "Blush Pink", hex: C.pink, hex2: C.white, cond: "like-new", p: 10800, o: 24000, art: "sneaker", v: 5, mat: "Suede upper, rubber sole", d: 2, pop: 90 },
  { b: "Nike", n: "Low Court Sneakers", cat: "shoes", g: "women", t: "Sneakers", s: "UK 6", col: "White / Green", hex: C.white, hex2: C.forest, cond: "excellent", p: 10200, o: 25000, art: "sneaker", v: 2, mat: "Leather upper, rubber sole", d: 8, pop: 86 },
  { b: "Dr. Martens", n: "Lace-Up Leather Boots", cat: "shoes", g: "women", t: "Boots", s: "UK 5", col: "Cherry", hex: C.cherry, hex2: C.wheat, cond: "good", p: 15500, o: 38000, art: "boot", v: 1, mat: "Smooth leather, air-cushioned sole", d: 10, pop: 88 },
  { b: "Levi's", n: "High-Rise Mom Jeans", cat: "jeans", g: "women", t: "Jeans", s: "28", col: "Light Wash", hex: C.denimL, hex2: C.sand, cond: "good", p: 4800, o: 13500, art: "jeans", v: 3, fab: "denim", mat: "100% cotton denim", d: 9, pop: 84 },
  { b: "Zara", n: "Wide-Leg Jeans", cat: "jeans", g: "women", t: "Jeans", s: "27", col: "Wide Mid Blue", hex: C.denim, hex2: C.sand, cond: "excellent", p: 4100, o: 9500, art: "jeans", v: 4, fab: "denim", mat: "Cotton denim", d: 4, pop: 78 },
  /* ---------------- KIDS ---------------- */
  { b: "Nike", n: "Kids Pullover Hoodie", cat: "hoodies", g: "kids", t: "Hoodie", s: "8-9Y", col: "Blue", hex: C.blue, hex2: C.white, cond: "excellent", p: 3200, o: 8500, art: "hoodie", v: 5, mat: "Cotton-poly fleece", d: 3, pop: 70 },
  { b: "Gap", n: "Kids Logo Hoodie", cat: "hoodies", g: "kids", t: "Hoodie", s: "10-11Y", col: "Navy", hex: C.navy, hex2: C.white, cond: "good", p: 2400, o: 6500, art: "hoodie", v: 1, mark: "GAP", mat: "Cotton-blend fleece", d: 11, pop: 58 },
  { b: "H&M", n: "Kids Denim Jacket", cat: "jackets", g: "kids", t: "Denim jacket", s: "6-7Y", col: "Washed Blue", hex: C.denimL, hex2: C.sand, cond: "like-new", p: 2900, o: 6500, art: "trucker", v: 2, fab: "denim", mat: "Cotton denim", d: 5, pop: 66 },
  { b: "Zara", n: "Kids Puffer Jacket", cat: "jackets", g: "kids", t: "Puffer jacket", s: "7-8Y", col: "Mustard", hex: C.mustard, hex2: C.black, cond: "excellent", p: 3900, o: 10500, art: "puffer", v: 2, mat: "Nylon shell, polyester fill", d: 6, pop: 68 },
  { b: "H&M", n: "Kids Graphic Tee", cat: "t-shirts", g: "kids", t: "T-shirt", s: "5-6Y", col: "Teal", hex: C.teal, hex2: C.cream, cond: "like-new", p: 900, o: 2200, art: "tee", v: 3, mat: "100% cotton jersey", d: 2, pop: 57, stock: 2 },
  { b: "Uniqlo", n: "Kids Crew Tee", cat: "t-shirts", g: "kids", t: "T-shirt", s: "9-10Y", col: "Coral", hex: C.coral, hex2: C.white, cond: "excellent", p: 800, o: 2000, art: "tee", mat: "100% cotton jersey", d: 9, pop: 54 },
  { b: "Zara", n: "Kids Poplin Shirt", cat: "shirts", g: "kids", t: "Shirt", s: "8-9Y", col: "Sky Blue", hex: C.sky, hex2: C.navy, cond: "excellent", p: 1600, o: 4200, art: "shirt", mat: "Cotton poplin", d: 7, pop: 55 },
  { b: "Adidas", n: "Kids Runner Sneakers", cat: "shoes", g: "kids", t: "Sneakers", s: "UK 2", col: "Grey / Coral", hex: C.grey, hex2: C.coral, cond: "good", p: 3600, o: 9500, art: "sneaker", v: 3, mat: "Mesh upper, rubber sole", d: 4, pop: 71 },
  { b: "Nike", n: "Kids Baseball Cap", cat: "caps", g: "kids", t: "Cap", s: "One size", col: "Red", hex: C.red, hex2: C.white, cond: "excellent", p: 1200, o: 3200, art: "cap", v: 3, mat: "Cotton twill", d: 13, pop: 50 },
  { b: "Herschel", n: "Kids Mini Backpack", cat: "bags", g: "kids", t: "Backpack", s: "One size", col: "Forest", hex: C.forest, hex2: C.tan, cond: "like-new", p: 3400, o: 8500, art: "pack", v: 1, mat: "Recycled polyester", d: 6, pop: 61 },
  { b: "Levi's", n: "Kids Straight Jeans", cat: "jeans", g: "kids", t: "Jeans", s: "8-9Y", col: "Mid Blue", hex: C.denim, hex2: C.sand, cond: "good", p: 1900, o: 5500, art: "jeans", v: 1, fab: "denim", mat: "Cotton denim", d: 12, pop: 56 },
  /* ---------------- MORE SHOES (the launch category) ---------------- */
  { b: "Puma", n: "Suede Classic Sneakers", cat: "shoes", g: "men", t: "Sneakers", s: "UK 9", col: "Black / White", hex: C.black, hex2: C.white, cond: "excellent", p: 8200, o: 19000, art: "sneaker", v: 5, mat: "Suede upper, rubber sole", d: 1, pop: 82 },
  { b: "Reebok", n: "Club C 85 Sneakers", cat: "shoes", g: "men", t: "Sneakers", s: "UK 8", col: "White / Green", hex: C.white, hex2: C.forest, cond: "good", p: 7200, o: 17500, art: "sneaker", v: 1, mat: "Leather upper, rubber outsole", d: 6, pop: 76 },
  { b: "Asics", n: "Gel-Lyte Running Shoes", cat: "shoes", g: "men", t: "Running shoes", s: "UK 10", col: "Grey / Blue", hex: C.grey, hex2: C.blue, cond: "like-new", p: 13500, o: 32000, art: "sneaker", v: 2, mat: "Mesh and suede upper, gel cushioning", d: 2, pop: 85 },
  { b: "Jordan", n: "Air Jordan 1 Mid", cat: "shoes", g: "men", t: "Basketball shoes", s: "UK 9", col: "Red / Black", hex: C.red, hex2: C.black, cond: "excellent", p: 22500, o: 48000, art: "sneaker", v: 4, mat: "Leather upper, rubber sole", d: 3, pop: 97 },
  { b: "Skechers", n: "Slip-On Walking Shoes", cat: "shoes", g: "men", t: "Walking shoes", s: "UK 10", col: "Charcoal", hex: C.charcoal, hex2: C.grey, cond: "good", p: 5200, o: 12500, art: "sneaker", v: 3, mat: "Knit mesh upper, memory-foam insole", d: 12, pop: 60 },
  { b: "Clarks", n: "Desert Boots", cat: "shoes", g: "men", t: "Boots", s: "UK 9", col: "Sand", hex: C.sand, hex2: C.brown, cond: "good", p: 11500, o: 28000, art: "boot", v: 1, mat: "Suede upper, crepe sole", d: 9, pop: 72 },
  { b: "Nike", n: "Dunk Low Retro", cat: "shoes", g: "men", t: "Sneakers", s: "UK 8", col: "Grey / White", hex: C.grey, hex2: C.white, cond: "like-new", p: 16500, o: 36000, art: "sneaker", v: 3, mat: "Leather upper, rubber cupsole", d: 4, pop: 93 },
  { b: "Adidas", n: "Ultraboost Running Shoes", cat: "shoes", g: "men", t: "Running shoes", s: "UK 10", col: "Black", hex: C.black, hex2: C.grey, cond: "excellent", p: 15500, o: 38000, art: "sneaker", v: 1, mat: "Knit upper, cushioned midsole", d: 5, pop: 87 },
  { b: "Converse", n: "Chuck Taylor All Star Low", cat: "shoes", g: "unisex", t: "Low-top sneakers", s: "UK 9", col: "Navy", hex: C.navy, hex2: C.white, cond: "good", p: 5200, o: 12000, art: "sneaker", v: 5, mat: "Canvas upper, vulcanised rubber sole", d: 15, pop: 66 },
  { b: "Vans", n: "Sk8-Hi Skate Shoes", cat: "shoes", g: "unisex", t: "High-top sneakers", s: "UK 8", col: "Black / White", hex: C.black, hex2: C.white, cond: "excellent", p: 6800, o: 17000, art: "sneaker", v: 2, mat: "Suede and canvas, waffle rubber sole", d: 7, pop: 78 },
  { b: "Nike", n: "Air Force 1 '07", cat: "shoes", g: "women", t: "Sneakers", s: "UK 6", col: "White", hex: C.white, hex2: C.grey, cond: "like-new", p: 13500, o: 30000, art: "sneaker", v: 4, mat: "Leather upper, rubber cupsole", d: 1, pop: 96 },
  { b: "New Balance", n: "327 Retro Sneakers", cat: "shoes", g: "women", t: "Sneakers", s: "UK 5", col: "Sage / Cream", hex: C.sage, hex2: C.cream, cond: "excellent", p: 11200, o: 26000, art: "sneaker", v: 3, mat: "Suede and mesh upper, rubber sole", d: 3, pop: 84 },
  { b: "Puma", n: "Cali Platform Sneakers", cat: "shoes", g: "women", t: "Sneakers", s: "UK 4", col: "White / Pink", hex: C.white, hex2: C.pink, cond: "good", p: 6900, o: 16500, art: "sneaker", v: 1, mat: "Leather upper, platform rubber sole", d: 10, pop: 70 },
  { b: "Adidas", n: "Stan Smith Sneakers", cat: "shoes", g: "women", t: "Sneakers", s: "UK 6", col: "White / Green", hex: C.white, hex2: C.forest, cond: "excellent", p: 9800, o: 24000, art: "sneaker", v: 0, mat: "Leather upper, rubber cupsole", d: 6, pop: 88 },
  { b: "Skechers", n: "Go Walk Slip-Ons", cat: "shoes", g: "women", t: "Walking shoes", s: "UK 5", col: "Grey / Pink", hex: C.grey, hex2: C.pink, cond: "good", p: 4600, o: 11000, art: "sneaker", v: 5, mat: "Knit mesh upper, lightweight sole", d: 14, pop: 58 },
  { b: "Timberland", n: "Premium 6-Inch Boots", cat: "shoes", g: "women", t: "Boots", s: "UK 5", col: "Wheat", hex: C.wheat, hex2: C.brown, cond: "excellent", p: 17500, o: 42000, art: "boot", v: 1, mat: "Waterproof nubuck leather", d: 8, pop: 89 },
  { b: "Nike", n: "Kids Court Borough Sneakers", cat: "shoes", g: "kids", t: "Sneakers", s: "UK 1", col: "White / Navy", hex: C.white, hex2: C.navy, cond: "like-new", p: 3800, o: 9000, art: "sneaker", v: 4, mat: "Synthetic leather upper, rubber sole", d: 2, pop: 69 },
  { b: "Puma", n: "Kids Runner Sneakers", cat: "shoes", g: "kids", t: "Sneakers", s: "UK 3", col: "Black / Coral", hex: C.black, hex2: C.coral, cond: "excellent", p: 3400, o: 8500, art: "sneaker", v: 2, mat: "Mesh upper, rubber sole", d: 5, pop: 64 },
  { b: "Converse", n: "Kids Chuck Taylor High Tops", cat: "shoes", g: "kids", t: "High-top sneakers", s: "UK 4", col: "Red", hex: C.red, hex2: C.white, cond: "good", p: 3200, o: 8000, art: "sneaker", v: 5, mat: "Canvas upper, vulcanised rubber sole", d: 9, pop: 62 },
];

/* ------------------------------------------------------------------ */
/* Build Product objects                                               */
/* ------------------------------------------------------------------ */

function build(r: Row, i: number): Product {
  const kind = KIND[r.art];
  const id = `p${String(i + 1).padStart(3, "0")}`;
  const sizeSlug = slugify(r.s.replace(/^UK\s*/i, ""));
  const slug = slugify(`${r.b} ${r.n} ${r.col} size ${sizeSlug}`);
  const ref = new Date(siteConfig.catalogReferenceDate).getTime();
  const addedAt = new Date(ref - r.d * 86400000 - (i % 5) * 3600000).toISOString();
  const name = r.n;
  const brandText = r.b;
  const art: ArtSpec = { garment: r.art, color: r.hex, color2: r.hex2, variant: r.v ?? 0, mark: r.mark ?? undefined, fabric: r.fab };
  const views = viewsFor(kind, r.art);
  const images: ProductImage[] = views.map((view) => ({
    view,
    alt: `${brandText} ${name} in ${r.col}, ${VIEW_LABEL[view]}`,
  }));
  const notes = r.notes ?? NOTES[kind][r.cond];
  const description = `${brandText} ${name.toLowerCase()} in ${r.col.toLowerCase()}, size ${r.s}. ${FLAVOUR[r.art]} Listed in ${r.cond.replace("-", " ")} condition — every mark and sign of wear is disclosed below and photographed in the gallery.`;
  return {
    id,
    sku: `SEQ-${CAT_CODE[r.cat]}-${String(i + 101).padStart(4, "0")}`,
    slug,
    name,
    brand: brandText,
    category: r.cat,
    gender: r.g,
    type: r.t,
    size: r.s,
    color: r.col,
    colorHex: r.hex,
    condition: r.cond,
    price: r.p,
    originalPrice: r.o,
    description,
    conditionNotes: notes,
    wearNote: r.wear ?? WEAR[kind][r.cond],
    measurements: measurementsFor(r),
    material: r.mat,
    authenticity: {
      checked: true,
      note: `Reviewed against brand labelling, stitching, hardware and production codes before listing.`,
    },
    stock: r.stock ?? 1,
    status: "active",
    addedAt,
    popularity: r.pop,
    keywords: [r.t.toLowerCase(), r.col.toLowerCase(), r.mat.toLowerCase()],
    images,
    art,
  };
}

export const PRODUCTS: Product[] = ROWS.map(build);
