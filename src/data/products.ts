/**
 * BUILT-IN CATALOGUE ROWS
 * ---------------------------------------------------------------------------
 * Intentionally empty — the demo/seed listings that used to live here have
 * been removed. Every real product now comes from the admin panel
 * ("Add new product" at /admin/products/new), stored in Supabase's
 * `custom_products` table and merged in by lib/catalog.ts. This file stays
 * around only as the generator machinery (measurements, condition notes,
 * flavour copy, etc.) in case you ever want to bulk-seed rows again — add
 * entries to ROWS below and they'll show up the same way the old demo
 * products did.
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

// No seed rows — add entries here (matching the Row shape above) if you ever want to
// bulk-import listings again. Real inventory is added through /admin/products/new.
const ROWS: Row[] = [];

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
    sku: `BW-${CAT_CODE[r.cat]}-${String(i + 101).padStart(4, "0")}`,
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
