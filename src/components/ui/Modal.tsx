"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/format";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  hideTitle?: boolean;
  children: ReactNode;
  /** center = dialog (bottom sheet on phones) · right / left = drawers · full = fullscreen viewer */
  variant?: "center" | "right" | "left" | "full" | "top";
  wide?: boolean;
  className?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, hideTitle, children, variant = "center", wide, className, initialFocusRef }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const last = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    last.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      const el = initialFocusRef?.current ?? panel.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); }
      if (e.key === "Tab" && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null);
        if (!items.length) return;
        const first = items[0], lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      last.current?.focus?.();
    };
  }, [open, onClose, initialFocusRef]);

  if (typeof document === "undefined") return null;

  const motionByVariant = {
    center: { initial: { opacity: 0, y: 32, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 24, scale: 0.98 } },
    right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
    left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
    full: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    top: { initial: { y: "-100%" }, animate: { y: 0 }, exit: { y: "-100%" } },
  }[variant];

  const wrap = {
    center: "items-end justify-center sm:items-center p-0 sm:p-6",
    right: "items-stretch justify-end",
    left: "items-stretch justify-start",
    full: "items-stretch justify-stretch",
    top: "items-start justify-center",
  }[variant];
  const size = {
    center: cn("w-full max-h-[92dvh] rounded-t-3xl sm:rounded-3xl", wide ? "sm:max-w-4xl" : "sm:max-w-xl"),
    top: "w-full max-h-[92dvh] rounded-b-3xl",
    right: "h-full w-[min(440px,100vw)]",
    left: "h-full w-[min(400px,92vw)]",
    full: "h-full w-full",
  }[variant];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-[100] flex", wrap)} role="presentation">
          <motion.div
            className="absolute inset-0"
            style={{ background: variant === "full" ? "rgba(6,6,5,0.94)" : "var(--overlay)", backdropFilter: variant === "full" ? undefined : "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            {...motionByVariant}
            transition={{ type: "tween", duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className={cn("relative flex flex-col overflow-hidden bg-bg text-fg shadow-lift", variant !== "full" && "border border-line", size, className)}
          >
            {!hideTitle && variant !== "full" && (
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="text-xl">{title}</h2>
                <button type="button" onClick={onClose} aria-label="Close" className="tap inline-flex items-center justify-center rounded-full hover:bg-soft"><X className="size-5" /></button>
              </div>
            )}
            {hideTitle && <h2 className="sr-only">{title}</h2>}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
