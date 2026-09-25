"use client";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Banknote, Check, ChevronDown, CreditCard, Lock, ShoppingBag, Smartphone, WifiOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DeliveryPicker } from "@/components/cart/DeliveryPicker";
import { MiniLines, TotalsRows } from "@/components/cart/OrderSummary";
import { PromoField } from "@/components/cart/PromoField";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckboxField, SelectField, TextField, clean } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { CartSkeleton } from "@/components/ui/LoadingState";
import { isEmail, isPhone } from "@/lib/adapters/auth";
import { OutOfStockError, placeOrder } from "@/lib/adapters/orders";
import { getProvider, PAYMENT_PROVIDERS } from "@/lib/adapters/payments";
import { PROVINCES, siteConfig } from "@/lib/config";
import { cn, formatPrice } from "@/lib/format";
import { useCartSummary } from "@/lib/hooks/useCartSummary";
import type { PaymentMethodId } from "@/lib/types";
import { useAuth, useCheckout, useReady, useUI } from "@/store";

const STEPS = ["Customer", "Shipping", "Delivery", "Payment"] as const;
type Errors = Record<string, string>;
type Failure = { type: "payment" | "stock" | "network"; message: string; items?: string[] } | null;

const payIcon: Record<PaymentMethodId, typeof Banknote> = { cod: Banknote, "bank-transfer": Smartphone, online: CreditCard };

export function CheckoutClient() {
  const router = useRouter();
  const ready = useReady();
  const user = useAuth((s) => s.user);
  const c = useCheckout();
  const s = useCartSummary(c.delivery);
  const toast = useUI((st) => st.toast);
  const [errors, setErrors] = useState<Errors>({});
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gateway, setGateway] = useState(false);
  const [failure, setFailure] = useState<Failure>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const step = c.step;

  // prefill from the signed-in account once
  useEffect(() => {
    if (!ready || !user) return;
    if (!c.customer.fullName && !c.customer.email) c.patch({ customer: { fullName: user.fullName, email: user.email, phone: user.phone ?? "" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  const setCustomer = (k: keyof typeof c.customer, v: string) => c.patch({ customer: { ...c.customer, [k]: v } });
  const setShipping = (k: keyof typeof c.shipping, v: string) => c.patch({ shipping: { ...c.shipping, [k]: v } });

  const validate = (n: number): Errors => {
    const e: Errors = {};
    if (n === 1) {
      if (clean(c.customer.fullName).length < 2) e.fullName = "Please enter your full name.";
      if (!isPhone(c.customer.phone)) e.phone = "Enter a valid phone number, e.g. 0300 1234567.";
      if (!isEmail(c.customer.email)) e.email = "Enter a valid email address.";
    }
    if (n === 2) {
      if (clean(c.shipping.address).length < 8) e.address = "Please enter your full street address.";
      if (clean(c.shipping.city).length < 2) e.city = "Please enter your city.";
      if (!PROVINCES.includes(c.shipping.province as (typeof PROVINCES)[number])) e.province = "Please select your province.";
      if (!/^\d{4,6}$/.test(c.shipping.postalCode.trim())) e.postalCode = "Enter a 4–6 digit postal code.";
    }
    if (n === 4) {
      if (!getProvider(c.payment)) e.payment = "Please choose a payment method.";
      if (!agree) e.agree = "Please accept the terms to place your order.";
    }
    return e;
  };

  const goTo = (n: number) => { setErrors({}); c.patch({ step: n }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) { setTimeout(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus(), 30); return; }
    goTo(step + 1);
  };

  const finalize = (paymentStatus: "pending" | "paid" | "awaiting-verification") => {
    try {
      const order = placeOrder({
        customer: { fullName: clean(c.customer.fullName), phone: clean(c.customer.phone, 20), email: clean(c.customer.email, 120).toLowerCase() },
        shipping: { fullName: clean(c.customer.fullName), phone: clean(c.customer.phone, 20), address: clean(c.shipping.address, 250), city: clean(c.shipping.city, 80), province: c.shipping.province, postalCode: c.shipping.postalCode.trim() },
        delivery: c.delivery, payment: c.payment, paymentStatus, userId: user?.id,
      });
      c.reset();
      router.push(`/order-confirmation?id=${order.id}`);
    } catch (err) {
      if (err instanceof OutOfStockError) setFailure({ type: "stock", message: "Some pairs sold out while you were checking out. Your card was not charged and no order was placed.", items: err.items });
      else setFailure({ type: "network", message: "Something went wrong while placing your order. Please try again." });
      setSubmitting(false);
    }
  };

  const place = async () => {
    const e = validate(4);
    setErrors(e);
    if (Object.keys(e).length) return;
    setFailure(null);
    if (typeof navigator !== "undefined" && navigator.onLine === false) { setFailure({ type: "network", message: "You appear to be offline. Reconnect and try again — your details are saved." }); return; }
    setSubmitting(true);
    try {
      const res = await getProvider(c.payment)!.initiate({ orderId: "pending", amount: s.total, email: c.customer.email });
      if (!res.ok) { setFailure({ type: "payment", message: res.error }); setSubmitting(false); return; }
      if (res.status === "requires-action") { setGateway(true); setSubmitting(false); return; }
      finalize(res.status);
    } catch {
      setFailure({ type: "network", message: "We couldn't reach the payment service. Please check your connection and try again." });
      setSubmitting(false);
    }
  };

  const savedAddrs = user?.addresses ?? [];

  if (!ready) return <div className="container-x py-16"><CartSkeleton /></div>;
  if (s.items.length === 0)
    return <div className="container-x py-20"><h1 className="sr-only">Checkout</h1><EmptyState icon={ShoppingBag} title="Your bag is empty" message="Add a pair or two before checking out." primary={{ label: "Start shopping", href: "/shop" }} /></div>;

  const summary = (
    <div className="space-y-6">
      <MiniLines s={s} />
      {step < 4 && <PromoField subtotal={s.subtotal} />}
      <TotalsRows s={s} />
    </div>
  );

  return (
    <div className="container-x pb-10 pt-6 sm:pt-8">
      <Breadcrumbs items={[{ label: "Bag", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mb-8 mt-6 text-5xl sm:text-6xl">Checkout</h1>

      {/* stepper */}
      <ol className="mb-10 flex items-center" aria-label="Checkout progress">
        {STEPS.map((label, i) => {
          const n = i + 1; const done = n < step; const cur = n === step;
          return (
            <li key={label} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
              <button type="button" disabled={!done} onClick={() => goTo(n)} aria-current={cur ? "step" : undefined} className="group flex items-center gap-2.5 disabled:cursor-default">
                <span className={cn("grid size-9 place-items-center rounded-full border text-xs font-bold transition-all duration-500", done ? "border-fg bg-fg text-bg" : cur ? "border-accent bg-accent text-accent-fg scale-110" : "border-line-strong text-subtle")}>{done ? <Check className="size-4" /> : n}</span>
                <span className={cn("hidden text-xs font-bold uppercase tracking-[0.12em] sm:block", cur ? "text-fg" : "text-subtle")}>{label}</span>
              </button>
              {i < STEPS.length - 1 && <span aria-hidden className="mx-3 h-px flex-1 overflow-hidden bg-line"><span className="block h-full bg-fg transition-all duration-700 ease-[var(--ease)]" style={{ width: done ? "100%" : "0%" }} /></span>}
            </li>
          );
        })}
      </ol>

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] lg:gap-14">
        {/* mobile summary toggle */}
        <div className="lg:hidden">
          <button type="button" onClick={() => setSummaryOpen(!summaryOpen)} aria-expanded={summaryOpen} className="flex w-full items-center justify-between rounded-2xl border border-line bg-elev px-5 py-4 text-sm font-semibold">
            <span className="flex items-center gap-2"><ShoppingBag className="size-4" aria-hidden />{summaryOpen ? "Hide" : "Show"} order summary <ChevronDown className={cn("size-4 transition-transform", summaryOpen && "rotate-180")} aria-hidden /></span>
            <span className="text-base font-bold tabular-nums">{formatPrice(s.total)}</span>
          </button>
          {summaryOpen && <div className="mt-3 rounded-2xl border border-line bg-elev p-5">{summary}</div>}
        </div>

        <div className="min-w-0 lg:order-first">
          {failure && (
            <div role="alert" className="mb-8 rounded-3xl border border-danger/30 bg-danger-soft p-6 text-danger">
              <div className="flex gap-4">
                {failure.type === "network" ? <WifiOff className="mt-0.5 size-6 shrink-0" aria-hidden /> : <AlertTriangle className="mt-0.5 size-6 shrink-0" aria-hidden />}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl">{failure.type === "stock" ? "Some items just sold out" : failure.type === "payment" ? "Payment didn't go through" : "Connection problem"}</h2>
                  <p className="mt-1 text-sm">{failure.message}</p>
                  {failure.items && <ul className="mt-3 list-disc pl-5 text-sm">{failure.items.map((i) => <li key={i}>{i}</li>)}</ul>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {failure.type === "stock" ? <Button href="/cart" size="sm" variant="primary">Review my bag</Button> : <Button size="sm" onClick={() => { setFailure(null); place(); }}>Try again</Button>}
                    {failure.type === "payment" && <Button size="sm" variant="outline" onClick={() => { setFailure(null); c.patch({ payment: "cod" }); }}>Use Cash on Delivery</Button>}
                    <Button size="sm" variant="ghost" onClick={() => setFailure(null)}>Dismiss</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              {step === 1 && (
                <form noValidate onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-5">
                  <h2 className="text-3xl">Your details</h2>
                  {!user && <p className="text-sm text-muted">Have an account? <Link href="/account?next=/checkout" className="link-underline font-semibold text-fg">Sign in</Link> for faster checkout — or continue as a guest.</p>}
                  <TextField label="Full name" required autoComplete="name" value={c.customer.fullName} maxLength={80} onChange={(e) => setCustomer("fullName", e.target.value)} error={errors.fullName} />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField label="Phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" value={c.customer.phone} maxLength={20} onChange={(e) => setCustomer("phone", e.target.value)} error={errors.phone} hint="For delivery updates" />
                    <TextField label="Email" required type="email" inputMode="email" autoComplete="email" value={c.customer.email} maxLength={120} onChange={(e) => setCustomer("email", e.target.value)} error={errors.email} hint="For your order confirmation" />
                  </div>
                  <div className="pt-2"><Button type="submit" size="lg" arrow>Continue to shipping</Button></div>
                </form>
              )}

              {step === 2 && (
                <form noValidate onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-5">
                  <h2 className="text-3xl">Shipping address</h2>
                  {savedAddrs.length > 0 && (
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Saved addresses">
                      {savedAddrs.map((a) => (
                        <button key={a.id} type="button" onClick={() => c.patch({ shipping: { address: a.address, city: a.city, province: a.province, postalCode: a.postalCode } })} className="rounded-full border border-line-strong px-4 py-2 text-xs font-semibold transition hover:bg-fg hover:text-bg">{a.label} · {a.city}</button>
                      ))}
                    </div>
                  )}
                  <TextField label="Address" required autoComplete="street-address" placeholder="House / flat, street, area" value={c.shipping.address} maxLength={250} onChange={(e) => setShipping("address", e.target.value)} error={errors.address} />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField label="City" required autoComplete="address-level2" value={c.shipping.city} maxLength={80} onChange={(e) => setShipping("city", e.target.value)} error={errors.city} />
                    <SelectField label="Province" required autoComplete="address-level1" value={c.shipping.province} onChange={(e) => setShipping("province", e.target.value)} error={errors.province}>
                      <option value="">Select province</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </SelectField>
                  </div>
                  <TextField label="Postal code" required inputMode="numeric" autoComplete="postal-code" value={c.shipping.postalCode} maxLength={6} onChange={(e) => setShipping("postalCode", e.target.value.replace(/\D/g, ""))} error={errors.postalCode} className="sm:max-w-[50%]" />
                  <div className="flex flex-wrap gap-3 pt-2"><Button variant="outline" size="lg" onClick={() => goTo(1)}>Back</Button><Button type="submit" size="lg" arrow>Continue to delivery</Button></div>
                </form>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-3xl">Delivery method</h2>
                  <DeliveryPicker value={c.delivery} onChange={(d) => c.patch({ delivery: d })} subtotal={s.subtotal - s.discount} freeShippingPromo={!!(s.promo && s.promo.ok && s.promo.freeShipping)} />
                  <div className="flex flex-wrap gap-3 pt-2"><Button variant="outline" size="lg" onClick={() => goTo(2)}>Back</Button><Button size="lg" arrow onClick={next}>Continue to payment</Button></div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-3xl">Payment method</h2>
                  <fieldset>
                    <legend className="sr-only">Payment method</legend>
                    <div className="space-y-2.5">
                      {PAYMENT_PROVIDERS.map((p) => {
                        const Icon = payIcon[p.id]; const on = c.payment === p.id;
                        return (
                          <label key={p.id} className={cn("flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ring)]", on ? "border-fg bg-elev shadow-soft" : "border-line hover:border-line-strong")}>
                            <input type="radio" name="payment" value={p.id} checked={on} onChange={() => c.patch({ payment: p.id })} className="sr-only" />
                            <span aria-hidden className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition", on ? "border-fg bg-fg text-bg" : "border-line-strong")}>{on && <Check className="size-3.5" />}</span>
                            <Icon className="mt-0.5 size-6 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
                            <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-sm font-semibold">{p.label}{p.badge && <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">{p.badge}</span>}</span><span className="mt-0.5 block text-xs text-muted">{p.description}</span></span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  {c.payment === "bank-transfer" && (
                    <div className="rounded-2xl bg-soft p-5 text-sm">
                      <p className="mb-3 font-semibold">Transfer details</p>
                      <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-[auto_1fr]"><dt className="text-muted">Send via</dt><dd>{siteConfig.payments.bankTransfer.services.join(" / ")}</dd><dt className="text-muted">Number</dt><dd className="tabular-nums">{siteConfig.payments.bankTransfer.number}</dd></dl>
                      <p className="mt-3 text-xs text-muted">{siteConfig.payments.bankTransfer.note}</p>
                    </div>
                  )}
                  <div className="space-y-2 rounded-2xl border border-line p-5 text-sm">
                    <p className="font-semibold">Review</p>
                    <p className="text-muted">{c.customer.fullName} · {c.customer.phone} · {c.customer.email}</p>
                    <p className="text-muted">{c.shipping.address}, {c.shipping.city}, {c.shipping.province} {c.shipping.postalCode}</p>
                    <p className="text-muted">{siteConfig.delivery.find((d) => d.id === c.delivery)?.label}</p>
                  </div>
                  <div>
                    <CheckboxField checked={agree} onChange={setAgree} label={<>I agree to the <Link href="/policies/terms" target="_blank" className="underline">Terms & Conditions</Link> and <Link href="/policies/returns" target="_blank" className="underline">Return & Exchange Policy</Link>.</>} />
                    {errors.agree && <p role="alert" className="mt-2 text-xs font-medium text-danger">{errors.agree}</p>}
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button variant="outline" size="lg" onClick={() => goTo(3)}>Back</Button>
                    <Button size="lg" variant="accent" loading={submitting} onClick={place} icon={<Lock className="size-4" />}>Place order · {formatPrice(s.total)}</Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside aria-label="Order summary" className="hidden rounded-3xl border border-line bg-elev p-7 lg:sticky lg:top-28 lg:block">
          <h2 className="mb-6 text-2xl">Order summary</h2>
          {summary}
        </aside>
      </div>

      {/* Demo payment gateway — stands in for a real hosted payment page */}
      <Modal open={gateway} onClose={() => { setGateway(false); }} title="Secure payment (demo gateway)">
        <div className="space-y-5 p-6">
          <p className="rounded-xl bg-warning-soft px-4 py-3 text-xs text-warning">This is a simulator standing in for a real payment gateway. No money moves and no card details are collected. Wire your provider in <code>lib/adapters/payments.ts</code>.</p>
          <p className="text-sm">Pay <b>{formatPrice(s.total)}</b> to {siteConfig.brand.name}</p>
          <div className="flex flex-col gap-3">
            <Button size="lg" variant="primary" onClick={() => { setGateway(false); setSubmitting(true); setTimeout(() => finalize("paid"), 500); }}>Simulate successful payment</Button>
            <Button size="lg" variant="outline" onClick={() => { setGateway(false); setFailure({ type: "payment", message: "Your payment was declined by the gateway (demo). No order was placed and you haven't been charged." }); toast({ kind: "error", title: "Payment declined" }); }}>Simulate failed payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
