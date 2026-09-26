"use client";
import { motion } from "framer-motion";
import { MessageCircle, PackageSearch } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/LoadingState";
import { siteConfig } from "@/lib/config";
import { formatPrice, paymentLabel } from "@/lib/format";
import { useAuth, useOrders, useReady } from "@/store";
import { OrderDetails } from "./OrderDetails";
import { OrderTracker } from "./OrderTracker";

export function ConfirmationClient() {
  const id = useSearchParams().get("id") ?? "";
  const ready = useReady();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const user = useAuth((s) => s.user);

  if (!ready) return <div className="container-x py-16"><Skeleton className="mx-auto h-64 max-w-2xl rounded-3xl" /></div>;
  if (!order)
    return (
      <div className="container-x py-10">
        <EmptyState icon={PackageSearch} title="We couldn't find that order" message="The link may be incomplete, or the order was placed on another device. You can look it up with your order number and email or phone." primary={{ label: "Track an order", href: "/track-order" }} secondary={{ label: "Continue shopping", href: "/shop" }} />
      </div>
    );

  const bank = order.paymentMethod === "bank-transfer";
  const waPay = order.paymentMethod === "online";
  const wa = `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(`Hi! I've placed order ${order.id} (${formatPrice(order.total)}) by bank transfer. Sharing my payment receipt.`)}`;
  const waPayLink = `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(`Hi! I've placed order ${order.id} (${formatPrice(order.total)}) and would like to pay online. Please share a way to pay.`)}`;
  const trackHref = `/track-order?id=${encodeURIComponent(order.id)}&contact=${encodeURIComponent(order.customer.email)}`;

  return (
    <div className="container-x pb-10 pt-10 sm:pt-16">
      <div className="mx-auto max-w-3xl text-center">
        <motion.svg viewBox="0 0 96 96" className="mx-auto size-24" aria-hidden initial="hidden" animate="show">
          <motion.circle cx="48" cy="48" r="42" fill="none" stroke="var(--accent)" strokeWidth="4" variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1 } }} transition={{ duration: 0.8, ease: "easeInOut" }} />
          <motion.path d="M28 50l14 14 27-30" fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1 } }} transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }} />
        </motion.svg>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="eyebrow mt-6">Order placed</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-3 text-balance text-4xl sm:text-6xl">Thank you, {order.customer.fullName.split(" ")[0]}.</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mx-auto mt-4 max-w-xl text-muted">
          Your order <strong className="font-bold text-fg">{order.id}</strong> is in. We&apos;ve reserved your pairs and will confirm details on {order.customer.email}. Total {formatPrice(order.total)} · {paymentLabel(order.paymentMethod)}.
        </motion.p>
      </div>

      {bank && (
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-line bg-soft p-6 sm:p-8">
          <h2 className="text-2xl">Complete your transfer</h2>
          <p className="mt-2 text-sm text-muted">{siteConfig.payments.bankTransfer.note}</p>
          <dl className="mt-5 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-muted">Send via</dt><dd className="font-medium">{siteConfig.payments.bankTransfer.services.join(" / ")}</dd>
            <dt className="text-muted">Number</dt><dd className="font-medium tabular-nums">{siteConfig.payments.bankTransfer.number}</dd>
            <dt className="text-muted">Amount</dt><dd className="font-bold tabular-nums">{formatPrice(order.total)}</dd>
            <dt className="text-muted">Reference</dt><dd className="font-bold">{order.id}</dd>
          </dl>
          <Button href={wa} target="_blank" rel="noopener noreferrer" variant="accent" className="mt-6" icon={<MessageCircle className="size-4" />}>Send receipt on WhatsApp</Button>
        </div>
      )}

      {waPay && (
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-line bg-soft p-6 sm:p-8">
          <h2 className="text-2xl">Complete your payment</h2>
          <p className="mt-2 text-sm text-muted">Message us on WhatsApp Business with your order number — we&apos;ll send you a secure way to pay (card link, bank or wallet) and confirm your order.</p>
          <dl className="mt-5 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-muted">Amount</dt><dd className="font-bold tabular-nums">{formatPrice(order.total)}</dd>
            <dt className="text-muted">Reference</dt><dd className="font-bold">{order.id}</dd>
          </dl>
          <Button href={waPayLink} target="_blank" rel="noopener noreferrer" variant="accent" className="mt-6" icon={<MessageCircle className="size-4" />}>Chat on WhatsApp to pay</Button>
        </div>
      )}

      <section aria-labelledby="track-h" className="mx-auto mt-12 max-w-5xl rounded-3xl border border-line bg-elev p-6 sm:p-10">
        <h2 id="track-h" className="mb-8 text-2xl">Order progress</h2>
        <OrderTracker order={order} />
        {siteConfig.demoMode && <p className="mt-8 text-xs text-subtle">Demo: order status advances automatically every few minutes so you can see tracking in action. A live store updates it from the admin panel.</p>}
      </section>

      <section aria-labelledby="sum-h" className="mx-auto mt-8 max-w-5xl rounded-3xl border border-line bg-elev p-6 sm:p-10">
        <h2 id="sum-h" className="mb-6 text-2xl">Order summary</h2>
        <OrderDetails order={order} />
      </section>

      <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-3">
        <Button href={trackHref} variant="primary" arrow>Track order</Button>
        <Button href="/shop" variant="outline">Continue shopping</Button>
        {!user && <Button href={`/account?mode=register&next=${encodeURIComponent("/account?tab=orders")}`} variant="ghost">Create an account</Button>}
      </div>
    </div>
  );
}
