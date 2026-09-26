"use client";
/**
 * CLIENT STATE (zustand + localStorage persistence).
 * This is the "local adapter" layer: cart, wishlist, recently viewed, orders and
 * sold-inventory overlay live in the browser so the store is fully usable with
 * no backend. Each store has a matching interface in lib/adapters so it can be
 * swapped for Supabase without touching components.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Address, CartLine, Order, PaymentMethodId, Product, User } from "@/lib/types";
import type { DeliveryId } from "@/lib/config";
import { getProductById } from "@/lib/catalog";
import { setProductOverrideCache } from "@/lib/productOverrideCache";

const storage = createJSONStorage(() => localStorage);
const opts = <T,>(name: string, partialize?: (s: T) => Partial<T>) => ({
  name: `beyondwear.${name}`,
  storage,
  skipHydration: true,
  ...(partialize ? { partialize } : {}),
});

/* ------------------------------ hydration ------------------------------ */
interface ReadyState { ready: boolean; setReady: () => void }
export const useReadyStore = create<ReadyState>((set) => ({ ready: false, setReady: () => set({ ready: true }) }));
export const useReady = () => useReadyStore((s) => s.ready);

/* -------------------------------- orders ------------------------------- */
interface OrdersState {
  orders: Order[];
  /** productId -> units sold through this storefront (demo inventory overlay). */
  soldCounts: Record<string, number>;
  addOrder: (o: Order) => void;
}
export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      soldCounts: {},
      addOrder: (o) =>
        set((s) => {
          const sold = { ...s.soldCounts };
          o.items.forEach((i) => (sold[i.productId] = (sold[i.productId] ?? 0) + i.qty));
          return { orders: [o, ...s.orders], soldCounts: sold };
        }),
    }),
    opts<OrdersState>("orders"),
  ),
);

/** Units still available = catalogue stock minus units sold through this storefront. */
export function availableOf(p: Product, sold: Record<string, number>): number {
  return Math.max(0, p.stock - (sold[p.id] ?? 0));
}
export function useAvailable(p: Product | undefined): number {
  const sold = useOrders((s) => s.soldCounts);
  return p ? availableOf(p, sold) : 0;
}

/* --------------------------------- toasts ------------------------------ */
export interface Toast {
  id: number;
  kind: "success" | "error" | "info";
  title: string;
  message?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}
interface UIState {
  searchOpen: boolean;
  cartOpen: boolean;
  menuOpen: boolean;
  quickViewId: string | null;
  sizeGuideOpen: boolean;
  toasts: Toast[];
  cartBump: number;
  setSearchOpen: (v: boolean) => void;
  setCartOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setQuickView: (id: string | null) => void;
  setSizeGuideOpen: (v: boolean) => void;
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  bump: () => void;
}
let toastId = 1;
export const useUI = create<UIState>((set, get) => ({
  searchOpen: false,
  cartOpen: false,
  menuOpen: false,
  quickViewId: null,
  sizeGuideOpen: false,
  toasts: [],
  cartBump: 0,
  setSearchOpen: (v) => set({ searchOpen: v, ...(v ? { menuOpen: false, cartOpen: false } : {}) }),
  setCartOpen: (v) => set({ cartOpen: v, ...(v ? { menuOpen: false, searchOpen: false } : {}) }),
  setMenuOpen: (v) => set({ menuOpen: v }),
  setQuickView: (id) => set({ quickViewId: id }),
  setSizeGuideOpen: (v) => set({ sizeGuideOpen: v }),
  toast: (t) => {
    const id = toastId++;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
    setTimeout(() => get().dismissToast(id), 4600);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  bump: () => set((s) => ({ cartBump: s.cartBump + 1 })),
}));

/* ---------------------------------- cart ------------------------------- */
export type AddResult = "added" | "in-cart" | "sold-out";
interface CartState {
  lines: CartLine[];
  promo: string | null;
  add: (p: Product) => AddResult;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  setPromo: (code: string | null) => void;
  clear: () => void;
}
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      promo: null,
      add: (p) => {
        const avail = availableOf(p, useOrders.getState().soldCounts);
        if (avail <= 0) return "sold-out";
        const existing = get().lines.find((l) => l.productId === p.id);
        if (existing) {
          if (existing.qty >= avail) return "in-cart";
          set({ lines: get().lines.map((l) => (l.productId === p.id ? { ...l, qty: l.qty + 1 } : l)) });
          return "added";
        }
        set({ lines: [...get().lines, { productId: p.id, qty: 1 }] });
        return "added";
      },
      remove: (id) => set({ lines: get().lines.filter((l) => l.productId !== id) }),
      setQty: (id, qty) => {
        const p = getProductById(id);
        const max = p ? availableOf(p, useOrders.getState().soldCounts) : 1;
        const q = Math.max(1, Math.min(qty, Math.max(max, 1)));
        set({ lines: get().lines.map((l) => (l.productId === id ? { ...l, qty: q } : l)) });
      },
      setPromo: (code) => set({ promo: code }),
      clear: () => set({ lines: [], promo: null }),
    }),
    opts<CartState>("cart", (s) => ({ lines: s.lines, promo: s.promo }) as Partial<CartState>),
  ),
);

/* -------------------------------- wishlist ----------------------------- */
interface WishState { ids: string[]; toggle: (id: string) => boolean; remove: (id: string) => void }
export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const has = get().ids.includes(id);
        set({ ids: has ? get().ids.filter((x) => x !== id) : [id, ...get().ids] });
        return !has;
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
    }),
    opts<WishState>("wishlist"),
  ),
);

/* --------------------------- recently viewed / search ------------------- */
interface RecentState {
  viewed: string[];
  searches: string[];
  view: (id: string) => void;
  addSearch: (q: string) => void;
  removeSearch: (q: string) => void;
  clearSearches: () => void;
}
export const useRecent = create<RecentState>()(
  persist(
    (set, get) => ({
      viewed: [],
      searches: [],
      view: (id) => set({ viewed: [id, ...get().viewed.filter((x) => x !== id)].slice(0, 12) }),
      addSearch: (q) => {
        const t = q.trim();
        if (!t) return;
        set({ searches: [t, ...get().searches.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6) });
      },
      removeSearch: (q) => set({ searches: get().searches.filter((x) => x !== q) }),
      clearSearches: () => set({ searches: [] }),
    }),
    opts<RecentState>("recent"),
  ),
);

/* ---------------------------------- auth ------------------------------- */
interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
  saveAddress: (a: Address) => void;
  removeAddress: (id: string) => void;
}
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      saveAddress: (a) => {
        const u = get().user;
        if (!u) return;
        const exists = u.addresses.some((x) => x.id === a.id);
        set({ user: { ...u, addresses: exists ? u.addresses.map((x) => (x.id === a.id ? a : x)) : [...u.addresses, a] } });
      },
      removeAddress: (id) => {
        const u = get().user;
        if (u) set({ user: { ...u, addresses: u.addresses.filter((x) => x.id !== id) } });
      },
    }),
    opts<AuthState>("session"),
  ),
);


/* ------------------------------ checkout draft ------------------------- */
interface CheckoutState {
  step: number;
  customer: { fullName: string; phone: string; email: string };
  shipping: { address: string; city: string; province: string; postalCode: string };
  delivery: DeliveryId;
  payment: PaymentMethodId;
  patch: (p: Partial<Omit<CheckoutState, "patch" | "reset">>) => void;
  reset: () => void;
}
const emptyCheckout = {
  step: 1,
  customer: { fullName: "", phone: "", email: "" },
  shipping: { address: "", city: "", province: "", postalCode: "" },
  delivery: "standard" as DeliveryId,
  payment: "cod" as PaymentMethodId,
};
/** Draft lives in sessionStorage only (personal data is not kept after the tab closes). */
export const useCheckout = create<CheckoutState>()(
  persist(
    (set) => ({ ...emptyCheckout, patch: (p) => set(p), reset: () => set({ ...emptyCheckout }) }),
    { name: "beyondwear.checkout", storage: createJSONStorage(() => sessionStorage), skipHydration: true },
  ),
);

/** Picks up any admin-edited product details (price, photos, stock, etc.) for the client's own reads. */
async function fetchClientProductOverrides() {
  try {
    const res = await fetch("/api/products/overrides", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setProductOverrideCache(data.overrides ?? {});
  } catch {
    // keep whatever the server already rendered with; not worth surfacing to the visitor
  }
}

/** Rehydrate every persisted store once on the client. */
export async function hydrateStores() {
  await Promise.all([
    useOrders.persist.rehydrate(),
    useCart.persist.rehydrate(),
    useWishlist.persist.rehydrate(),
    useRecent.persist.rehydrate(),
    useAuth.persist.rehydrate(),
    useCheckout.persist.rehydrate(),
    fetchClientProductOverrides(),
  ]);
  useReadyStore.getState().setReady();
}
