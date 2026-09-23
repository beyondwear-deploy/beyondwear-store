export type Condition = "new" | "like-new" | "excellent" | "good" | "fair";
export type Gender = "men" | "women" | "kids" | "unisex";
export type Category =
  | "shoes"
  | "jackets"
  | "shirts"
  | "t-shirts"
  | "tops"
  | "hoodies"
  | "jeans"
  | "caps"
  | "bags"
  | "accessories";

export type ImageView = "front" | "back" | "side" | "detail" | "label" | "wear";

export type GarmentKey =
  | "tee"
  | "shirt"
  | "hoodie"
  | "trucker"
  | "bomber"
  | "puffer"
  | "jeans"
  | "sneaker"
  | "boot"
  | "cap"
  | "tote"
  | "cross"
  | "pack"
  | "sunglasses"
  | "belt"
  | "watch";

/** Generated studio art parameters (used until real photography is uploaded). */
export interface ArtSpec {
  garment: GarmentKey;
  color: string;
  color2: string;
  /** graphic / print variant, 0 = plain */
  variant?: number;
  mark?: string;
  fabric?: "denim" | "knit" | "plain" | "leather" | "canvas";
}

export interface ProductImage {
  view: ImageView;
  alt: string;
  /** Real photo URL (Supabase Storage / CDN). If omitted, generated art is rendered. */
  src?: string;
  caption?: string;
}

export interface Measurement {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: Category;
  gender: Gender;
  type: string;
  size: string;
  color: string;
  colorHex: string;
  condition: Condition;
  price: number;
  originalPrice?: number;
  description: string;
  conditionNotes: string[];
  wearNote: string;
  measurements: Measurement[];
  material: string;
  authenticity: { checked: boolean; note: string };
  /** One-of-one by default: stock 1. 0 means SOLD OUT. */
  stock: number;
  status: "active" | "draft" | "archived";
  addedAt: string;
  popularity: number;
  keywords: string[];
  images: ProductImage[];
  art: ArtSpec;
}

export interface CartLine {
  productId: string;
  qty: number;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export type PaymentMethodId = "cod" | "bank-transfer" | "online";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out-for-delivery"
  | "delivered";

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  size: string;
  color: string;
  condition: Condition;
  price: number;
  qty: number;
  slug: string;
}

export interface Order {
  id: string;
  placedAt: string;
  customer: { fullName: string; phone: string; email: string };
  shipping: Omit<Address, "id" | "label">;
  deliveryMethod: string;
  paymentMethod: PaymentMethodId;
  paymentStatus: "pending" | "paid" | "awaiting-verification";
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCode?: string;
  userId?: string;
  /** Demo tracking: status is simulated from time since placement unless overridden. */
  statusOverride?: OrderStatus;
  /** Demo seed offset in minutes so seeded orders show mid-journey. */
  ageOffsetMin?: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  addresses: Address[];
}
