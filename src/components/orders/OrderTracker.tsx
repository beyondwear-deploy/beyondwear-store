"use client";
import { motion } from "framer-motion";
import { Check, ClipboardList, PackageCheck, PackageOpen, Truck, Home, MapPinned } from "lucide-react";
import { useEffect, useState } from "react";
import { statusOf } from "@/lib/adapters/orders";
import { cn, ORDER_STEPS } from "@/lib/format";
import type { Order } from "@/lib/types";

const ICONS = [ClipboardList, PackageCheck, PackageOpen, Truck, MapPinned, Home];

/** Re-renders on an interval so the demo status simulation advances while the page is open. */
function useNow(ms: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function OrderTracker({ order }: { order: Order }) {
  const now = useNow(4000);
  const { index } = statusOf(order, now);
  const pct = (index / (ORDER_STEPS.length - 1)) * 100;
  const done = index === ORDER_STEPS.length - 1;

  return (
    <div>
      <p className="sr-only" aria-live="polite">Current status: {ORDER_STEPS[index].label}</p>

      {/* desktop: horizontal */}
      <ol className="relative hidden grid-cols-6 gap-2 md:grid" aria-label="Order progress">
        <div aria-hidden className="absolute left-[8.33%] right-[8.33%] top-6 h-0.5 bg-line" />
        <motion.div aria-hidden className="absolute left-[8.33%] top-6 h-0.5 origin-left bg-accent" style={{ width: "83.33%" }} initial={{ scaleX: 0 }} animate={{ scaleX: pct / 100 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
        {ORDER_STEPS.map((s, i) => {
          const Icon = ICONS[i];
          const state = i < index || (done && i === index) ? "done" : i === index ? "current" : "todo";
          return (
            <li key={s.id} aria-current={state === "current" ? "step" : undefined} className="relative flex flex-col items-center text-center">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className={cn("relative z-10 grid size-12 place-items-center rounded-full border-2 transition-colors duration-500",
                  state === "done" && "border-accent bg-accent text-accent-fg",
                  state === "current" && "border-accent bg-bg text-accent",
                  state === "todo" && "border-line bg-bg text-subtle")}
              >
                {state === "done" ? <Check className="size-5" strokeWidth={3} aria-hidden /> : <Icon className="size-5" aria-hidden />}
                {state === "current" && <span aria-hidden className="absolute inset-0 animate-ping rounded-full border-2 border-accent opacity-30" />}
              </motion.span>
              <p className={cn("mt-3 text-xs font-bold uppercase tracking-[0.1em]", state === "todo" ? "text-subtle" : "text-fg")}>{s.label}</p>
              {state === "current" && <p className="mt-1 max-w-[9rem] text-xs text-muted">{s.hint}</p>}
            </li>
          );
        })}
      </ol>

      {/* mobile: vertical */}
      <ol className="relative space-y-6 md:hidden" aria-label="Order progress">
        <div aria-hidden className="absolute bottom-4 left-[19px] top-4 w-0.5 bg-line" />
        <motion.div aria-hidden className="absolute left-[19px] top-4 w-0.5 origin-top bg-accent" style={{ height: "calc(100% - 2rem)" }} initial={{ scaleY: 0 }} animate={{ scaleY: pct / 100 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
        {ORDER_STEPS.map((s, i) => {
          const Icon = ICONS[i];
          const state = i < index || (done && i === index) ? "done" : i === index ? "current" : "todo";
          return (
            <li key={s.id} aria-current={state === "current" ? "step" : undefined} className="relative flex items-start gap-4">
              <span className={cn("relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 transition-colors duration-500",
                state === "done" && "border-accent bg-accent text-accent-fg",
                state === "current" && "border-accent bg-bg text-accent",
                state === "todo" && "border-line bg-bg text-subtle")}>
                {state === "done" ? <Check className="size-4" strokeWidth={3} aria-hidden /> : <Icon className="size-4" aria-hidden />}
              </span>
              <div className="pt-1.5">
                <p className={cn("text-xs font-bold uppercase tracking-[0.1em]", state === "todo" ? "text-subtle" : "text-fg")}>{s.label}</p>
                {state !== "todo" && <p className="mt-0.5 text-sm text-muted">{s.hint}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
