"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

export interface AccordionItem { q: string; a: ReactNode }

export function Accordion({ items, allowMultiple = false, defaultOpen = 0 }: { items: AccordionItem[]; allowMultiple?: boolean; defaultOpen?: number | number[] | null }) {
  const [open, setOpen] = useState<number[]>(defaultOpen === null ? [] : Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen]);
  const base = useId();
  const toggle = (i: number) =>
    setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : allowMultiple ? [...o, i] : [i]));
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((it, i) => {
        const isOpen = open.includes(i);
        const id = `${base}-${i}`;
        return (
          <div key={i}>
            <h3 className="!font-sans !tracking-normal">
              <button
                type="button" id={`${id}-btn`} aria-expanded={isOpen} aria-controls={`${id}-panel`}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-semibold transition-colors hover:text-accent sm:text-lg"
              >
                <span>{it.q}</span>
                <Plus className={`size-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} aria-hidden />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-panel`} role="region" aria-labelledby={`${id}-btn`}
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden"
                >
                  <div className="pb-6 pr-10 text-sm leading-relaxed text-muted sm:text-base">{it.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
