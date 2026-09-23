"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { Button } from "@/components/ui/Button";
import { ConditionBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ main, topRight, midRight, badge, featured }: { main: Product; topRight: Product; midRight: Product; badge: Product; featured: Product }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yA = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const yB = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const yC = useTransform(scrollYProgress, [0, 1], [0, -130]);
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 160]);

  const line = (t: string, i: number, extra = "") => (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span className={`block ${extra}`} initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.15 + i * 0.14, ease }}>{t}</motion.span>
    </span>
  );
  const fade = (i: number) => ({ initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: 0.6 + i * 0.12, ease } });

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      {/* animated ambient background */}
      <motion.div aria-hidden style={{ y: yBg }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-10 size-[38rem] rounded-full bg-accent/15 blur-[110px] [animation:drift_18s_ease-in-out_infinite_alternate]" />
        <div className="absolute -right-24 top-1/3 size-[32rem] rounded-full bg-secondary/15 blur-[110px] [animation:drift_22s_ease-in-out_infinite_alternate-reverse]" />
      </motion.div>

      <div className="container-x grid items-center gap-12 py-10 sm:py-14 lg:min-h-[calc(100dvh-8.5rem)] lg:grid-cols-[1.08fr_1fr] lg:gap-8">
        <div>
          <motion.p {...fade(-2)} className="eyebrow mb-6 flex items-center gap-3"><span className="h-px w-10 bg-accent" aria-hidden />Preloved shoes · New pairs every week</motion.p>
          <h1 className="text-[clamp(3.4rem,11.5vw,8.6rem)] font-medium uppercase leading-[0.9] tracking-[-0.035em]">
            {line("Second", 0)}
            {line("chapter.", 1, "italic text-accent")}
          </h1>
          <motion.p {...fade(0)} className="mt-7 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Carefully selected preloved shoes, inspected and honestly graded. Every great pair deserves a sequel.
          </motion.p>
          <motion.div {...fade(1)} className="mt-9 flex flex-wrap gap-3">
            <Button href="/shop" size="lg" arrow>Shop now</Button>
            <Button href="#collections" size="lg" variant="outline">Explore</Button>
          </motion.div>
          <motion.ul {...fade(2)} className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {[[ShieldCheck, "Inspected"], [Sparkles, "Cleaned & photographed"], [Truck, "Delivered nationwide"]].map(([Icon, t]) => {
              const I = Icon as typeof ShieldCheck;
              return <li key={t as string} className="flex items-center gap-2"><I className="size-4 text-accent" aria-hidden />{t as string}</li>;
            })}
          </motion.ul>
        </div>

        {/* editorial collage */}
        <div className="relative mx-auto aspect-[5/6] w-full max-w-[560px] lg:max-w-none">
          <motion.div style={{ y: yA }} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.25, ease }} className="absolute left-0 top-[6%] h-[80%] w-[58%] overflow-hidden rounded-t-[999px] rounded-b-[2rem] shadow-lift ring-1 ring-line/60">
            <ProductImage product={main} tint="var(--accent-soft)" eager />
          </motion.div>
          <motion.div style={{ y: yB }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.1, delay: 0.45, ease }} className="absolute right-0 top-0 h-[38%] w-[40%] overflow-hidden rounded-3xl shadow-card ring-1 ring-line/60">
            <ProductImage product={topRight} tint="var(--bg-soft)" eager />
          </motion.div>
          <motion.div style={{ y: yC }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.1, delay: 0.6, ease }} className="absolute right-[3%] top-[42%] h-[36%] w-[38%] overflow-hidden rounded-3xl shadow-card ring-1 ring-line/60">
            <ProductImage product={midRight} tint="var(--accent-soft)" eager />
          </motion.div>
          <motion.div style={{ y: yA }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.9, ease }} className="absolute bottom-[4%] right-[6%] size-[24%] overflow-hidden rounded-full shadow-card ring-4 ring-bg">
            <ProductImage product={badge} tint="var(--bg-soft)" eager />
          </motion.div>

          {/* rotating seal */}
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 1.1, ease }} className="absolute -left-2 bottom-[10%] hidden size-28 sm:block" aria-hidden>
            <div className="size-full animate-[spin_22s_linear_infinite] rounded-full bg-accent p-1 text-accent-fg shadow-lift">
              <svg viewBox="0 0 120 120" className="size-full">
                <defs><path id="seal" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
                <text fontSize="10.5" fontWeight="700" fill="currentColor" fontFamily="Inter Variable, sans-serif"><textPath href="#seal" textLength="268" lengthAdjust="spacing">SECOND LIFE • LESS WASTE • MORE STYLE •</textPath></text>
                <circle cx="60" cy="60" r="6" fill="currentColor" />
              </svg>
            </div>
          </motion.div>

          {/* floating product card */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.2, ease }} className="absolute bottom-[-2%] left-[16%] w-[62%] max-w-[300px] [animation:float_6s_ease-in-out_infinite]">
            <Link href={`/product/${featured.slug}`} className="glass group flex items-center gap-3 rounded-2xl p-2.5 pr-4 shadow-lift transition hover:-translate-y-1">
              <div className="size-14 shrink-0 overflow-hidden rounded-xl"><ProductImage product={featured} /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{featured.brand} {featured.name}</p>
                <div className="mt-1 flex items-center gap-2"><ConditionBadge condition={featured.condition} className="!px-2 !py-0.5 !text-[9px]" /><span className="text-xs font-bold">{formatPrice(featured.price)}</span></div>
              </div>
              <ArrowUpRight className="size-4 shrink-0 opacity-60 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
