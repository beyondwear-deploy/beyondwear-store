"use client";
import { motion, AnimatePresence } from "framer-motion";
import { PackageSearch, SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { clean, Honeypot, TextField } from "@/components/ui/Form";
import { findOrder, statusOf } from "@/lib/adapters/orders";
import { siteConfig } from "@/lib/config";
import { formatDate, formatPrice, ORDER_STEPS } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useOrders, useReady } from "@/store";
import { OrderDetails } from "./OrderDetails";
import { OrderTracker } from "./OrderTracker";

export function TrackOrderClient() {
  const sp = useSearchParams();
  const ready = useReady();
  const orders = useOrders((s) => s.orders);
  const [id, setId] = useState(sp.get("id") ?? "");
  const [contact, setContact] = useState(sp.get("contact") ?? "");
  const [errors, setErrors] = useState<{ id?: string; contact?: string }>({});
  const [result, setResult] = useState<Order | "none" | null>(null);
  const [busy, setBusy] = useState(false);
  const auto = useRef(false);

  const lookup = (idv: string, cv: string) => {
    const e: typeof errors = {};
    if (!clean(idv)) e.id = "Enter your order number, e.g. SEQ-ABC123.";
    if (!clean(cv)) e.contact = "Enter the email or phone number used at checkout.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(findOrder(clean(idv, 40), clean(cv, 80), orders) ?? "none");
      setBusy(false);
    }, 550);
  };

  // arriving from the confirmation email / page: look up immediately
  useEffect(() => {
    if (!ready || auto.current) return;
    if (sp.get("id") && sp.get("contact")) { auto.current = true; lookup(sp.get("id")!, sp.get("contact")!); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((new FormData(e.currentTarget).get("company_website") as string)?.length) return; // bot
    lookup(id, contact);
  };

  const order = result && result !== "none" ? result : null;
  const step = order ? ORDER_STEPS[statusOf(order).index] : null;

  return (
    <div className="container-x pb-10 pt-6 sm:pt-8">
      <Breadcrumbs items={[{ label: "Track order" }]} />
      <div className="mx-auto mt-8 max-w-2xl text-center">
        <p className="eyebrow">Order tracking</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">Where&apos;s my order?</h1>
        <p className="mt-4 text-muted">Enter your order number and the email or phone number you used at checkout.</p>
      </div>

      <form onSubmit={submit} noValidate className="relative mx-auto mt-10 grid max-w-2xl gap-4 rounded-3xl border border-line bg-elev p-6 sm:grid-cols-2 sm:p-8">
        <Honeypot />
        <TextField label="Order number" required value={id} onChange={(e) => setId(e.target.value)} error={errors.id} placeholder="SEQ-ABC123" autoComplete="off" autoCapitalize="characters" />
        <TextField label="Email or phone" required value={contact} onChange={(e) => setContact(e.target.value)} error={errors.contact} placeholder="you@example.com" autoComplete="email" />
        <div className="sm:col-span-2">
          <Button type="submit" full loading={busy} icon={<PackageSearch className="size-4" />}>Track order</Button>
          {siteConfig.demoMode && (
            <p className="mt-3 text-center text-xs text-subtle">
              Try it: order <button type="button" className="font-semibold underline underline-offset-2" onClick={() => { setId("SEQ-DEMO01"); setContact("demo@example.com"); setErrors({}); }}>SEQ-DEMO01</button> with demo@example.com — or place your own order.
            </p>
          )}
        </div>
      </form>

      <div aria-live="polite">
        <AnimatePresence mode="wait">
          {result === "none" && (
            <motion.div key="none" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="mx-auto mt-8 flex max-w-2xl items-start gap-4 rounded-2xl bg-danger-soft p-5 text-danger">
              <SearchX className="mt-0.5 size-6 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">We couldn&apos;t find that order.</p>
                <p className="mt-1 text-sm opacity-90">Check the order number and use the exact email or phone from checkout. Orders placed on another device can&apos;t be found in this demo — a live store looks them up on the server. Need help? <a className="underline" href={`https://wa.me/${siteConfig.contact.whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a>.</p>
              </div>
            </motion.div>
          )}
          {order && step && (
            <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="mx-auto mt-10 max-w-5xl space-y-8">
              <section className="rounded-3xl border border-line bg-elev p-6 sm:p-10">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">Order {order.id}</p>
                    <h2 className="mt-2 text-3xl sm:text-4xl">{step.label}</h2>
                    <p className="mt-1 text-sm text-muted">{step.hint}</p>
                  </div>
                  <p className="text-right text-sm text-muted">Placed {formatDate(order.placedAt)}<br /><span className="font-semibold text-fg">{formatPrice(order.total)}</span></p>
                </div>
                <OrderTracker order={order} />
              </section>
              <section className="rounded-3xl border border-line bg-elev p-6 sm:p-10">
                <OrderDetails order={order} />
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
