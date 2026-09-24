"use client";
import { ArrowLeft, Clock, Heart, LogOut, MapPin, Package, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { OrderDetails } from "@/components/orders/OrderDetails";
import { OrderTracker } from "@/components/orders/OrderTracker";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductImage } from "@/components/product/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { clean, TextField } from "@/components/ui/Form";
import { Skeleton } from "@/components/ui/LoadingState";
import { isPhone, persistUserPatch } from "@/lib/adapters/auth";
import { statusOf } from "@/lib/adapters/orders";
import { getProductById } from "@/lib/catalog";
import { cn, formatDate, formatPrice, ORDER_STEPS } from "@/lib/format";
import type { Order, Product, User } from "@/lib/types";
import { useAuth, useOrders, useReady, useRecent, useUI } from "@/store";
import { AddressBook } from "./AddressBook";
import { AuthPanel, type AuthMode } from "./AuthPanel";
import { WishlistContent } from "./WishlistClient";

const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "recent", label: "Recently viewed", icon: Clock },
  { id: "profile", label: "Profile", icon: UserIcon },
] as const;
type TabId = (typeof TABS)[number]["id"];

const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : null);

export function AccountClient() {
  const ready = useReady();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const toast = useUI((s) => s.toast);
  const router = useRouter();
  const sp = useSearchParams();
  const [mode, setMode] = useState<AuthMode>((["login", "register", "forgot"] as const).find((m) => m === sp.get("mode")) ?? "login");

  if (!ready) return <div className="container-x py-16"><Skeleton className="mx-auto h-96 max-w-md rounded-3xl" /></div>;

  if (!user)
    return (
      <div className="container-x py-12 sm:py-20">
        <AuthPanel mode={mode} setMode={setMode} onAuthed={(u, isNew) => {
          setUser(u);
          toast({ kind: "success", title: isNew ? `Welcome, ${u.fullName.split(" ")[0]}!` : `Welcome back, ${u.fullName.split(" ")[0]}` });
          const next = safeNext(sp.get("next"));
          if (next) router.push(next);
        }} />
      </div>
    );

  return <Dashboard user={user} />;
}

function Dashboard({ user }: { user: User }) {
  const router = useRouter();
  const sp = useSearchParams();
  const setUser = useAuth((s) => s.setUser);
  const toast = useUI((s) => s.toast);
  const tab: TabId = TABS.find((t) => t.id === sp.get("tab"))?.id ?? "orders";
  const go = (t: TabId) => router.replace(`/account?tab=${t}`, { scroll: false });

  return (
    <div className="container-x pb-10 pt-6 sm:pt-8">
      <Breadcrumbs items={[{ label: "Account" }]} />
      <div className="mb-8 mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 text-5xl sm:text-6xl">Hi, {user.fullName.split(" ")[0]}.</h1>
          <p className="mt-2 text-sm text-muted">{user.email} · Member since {formatDate(user.createdAt)}</p>
        </div>
        <Button variant="outline" size="sm" icon={<LogOut className="size-4" />} onClick={() => { setUser(null); toast({ kind: "info", title: "Signed out" }); router.push("/"); }}>Sign out</Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-14">
        <nav aria-label="Account sections" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => go(t.id)} aria-current={tab === t.id ? "page" : undefined}
              className={cn("flex shrink-0 items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition-colors lg:rounded-xl", tab === t.id ? "bg-fg text-bg" : "text-muted hover:bg-soft hover:text-fg")}>
              <t.icon className="size-4" aria-hidden />{t.label}
            </button>
          ))}
        </nav>
        <section aria-live="polite" className="min-w-0">
          {tab === "orders" && <OrdersTab user={user} selected={sp.get("order")} />}
          {tab === "wishlist" && <div><h2 className="mb-6 text-3xl">Wishlist</h2><WishlistContent /></div>}
          {tab === "addresses" && <AddressBook />}
          {tab === "recent" && <RecentTab />}
          {tab === "profile" && <ProfileTab user={user} />}
        </section>
      </div>
    </div>
  );
}

/* --------------------------------- orders --------------------------------- */
function OrdersTab({ user, selected }: { user: User; selected: string | null }) {
  const all = useOrders((s) => s.orders);
  const router = useRouter();
  const mine = useMemo(() => all.filter((o) => o.userId === user.id || o.customer.email.toLowerCase() === user.email.toLowerCase()), [all, user]);
  const open = mine.find((o) => o.id === selected);

  if (open)
    return (
      <div>
        <button type="button" onClick={() => router.replace("/account?tab=orders", { scroll: false })} className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted hover:text-fg"><ArrowLeft className="size-4" aria-hidden />All orders</button>
        <h2 className="text-3xl">Order {open.id}</h2>
        <div className="mt-8 rounded-3xl border border-line bg-elev p-6 sm:p-8"><OrderTracker order={open} /></div>
        <div className="mt-8"><OrderDetails order={open} /></div>
      </div>
    );

  return (
    <div>
      <h2 className="mb-6 text-3xl">Order history</h2>
      {mine.length === 0 ? (
        <EmptyState icon={Package} title="No orders yet" message="When you place an order it will show up here so you can follow it from packed to delivered." primary={{ label: "Start shopping", href: "/shop" }} secondary={{ label: "Track an order", href: "/track-order" }} className="py-10" />
      ) : (
        <ul className="space-y-4">
          {mine.map((o) => <OrderRow key={o.id} order={o} />)}
        </ul>
      )}
    </div>
  );
}

function OrderRow({ order: o }: { order: Order }) {
  const st = ORDER_STEPS[statusOf(o).index];
  const first = getProductById(o.items[0]?.productId);
  return (
    <li>
      <Link href={`/account?tab=orders&order=${o.id}`} className="group flex items-center gap-4 rounded-2xl border border-line bg-elev p-4 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card sm:p-5">
        <div className="hidden size-16 shrink-0 overflow-hidden rounded-xl sm:block" style={{ background: "var(--art-bg-b)" }}>
          {first && <ProductImage product={first} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{o.id}</p>
          <p className="truncate text-sm text-muted">{formatDate(o.placedAt)} · {o.items.length} {o.items.length === 1 ? "item" : "items"} · {o.items.map((i) => i.brand).join(", ")}</p>
        </div>
        <div className="text-right">
          <Badge tone={st.id === "delivered" ? "success" : "accent"}>{st.label}</Badge>
          <p className="mt-1.5 text-sm font-semibold tabular-nums">{formatPrice(o.total)}</p>
        </div>
      </Link>
    </li>
  );
}

/* ------------------------------ recently viewed ---------------------------- */
function RecentTab() {
  const viewed = useRecent((s) => s.viewed);
  const items = useMemo(() => viewed.map(getProductById).filter((p): p is Product => !!p), [viewed]);
  return (
    <div>
      <h2 className="mb-6 text-3xl">Recently viewed</h2>
      {items.length === 0 ? <EmptyState icon={Clock} title="Nothing viewed yet" message="Pairs you open will appear here so you can find them again." primary={{ label: "Browse the shop", href: "/shop" }} className="py-10" /> : <ProductGrid products={items} />}
    </div>
  );
}

/* --------------------------------- profile -------------------------------- */
function ProfileTab({ user }: { user: User }) {
  const setUser = useAuth((s) => s.setUser);
  const toast = useUI((s) => s.toast);
  const [name, setName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (clean(name, 80).length < 2) er.name = "Please enter your full name.";
    if (phone.trim() && !isPhone(phone)) er.phone = "Enter a valid phone number.";
    setErrors(er);
    if (Object.keys(er).length) return;
    const next = { ...user, fullName: clean(name, 80), phone: clean(phone, 20) || undefined };
    setUser(next); persistUserPatch(next);
    toast({ kind: "success", title: "Profile updated" });
  };

  return (
    <div className="max-w-xl">
      <h2 className="mb-6 text-3xl">Profile</h2>
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField label="Full name" required value={name} maxLength={80} onChange={(e) => { setName(e.target.value); setErrors({}); }} error={errors.name} autoComplete="name" />
        <TextField label="Email" value={user.email} disabled hint="Email can't be changed in the demo." readOnly />
        <TextField label="Phone" type="tel" value={phone} maxLength={20} onChange={(e) => { setPhone(e.target.value); setErrors({}); }} error={errors.phone} autoComplete="tel" />
        <Button type="submit">Save changes</Button>
      </form>
    </div>
  );
}
