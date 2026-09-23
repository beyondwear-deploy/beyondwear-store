"use client";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

/** Scroll-triggered fade / slide-up. Runs once, GPU-only (opacity + transform). */
export function Reveal({ children, delay = 0, className, as = "div", y, id }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section"; y?: number; id?: string }) {
  const M = motion[as];
  return (
    <M
      id={id}
      className={className}
      variants={y ? { hidden: { opacity: 0, y }, show: { opacity: 1, y: 0 } } : variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}

/** Clip-path "image reveal" curtain. */
export function ImageReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, delay, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );
}
