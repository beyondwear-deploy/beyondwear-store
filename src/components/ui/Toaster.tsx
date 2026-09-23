"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import Link from "next/link";
import { useUI } from "@/store";

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismissToast);
  const icons = { success: CheckCircle2, error: XCircle, info: Info };
  const colors = { success: "text-success", error: "text-danger", info: "text-accent" };
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6" role="region" aria-label="Notifications" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = icons[t.kind];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-4 shadow-lift"
              role={t.kind === "error" ? "alert" : "status"}
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${colors[t.kind]}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.message && <p className="mt-0.5 text-sm text-muted">{t.message}</p>}
                {t.action && (t.action.href ? (
                  <Link href={t.action.href} onClick={() => dismiss(t.id)} className="link-underline mt-1.5 inline-block text-xs font-bold uppercase tracking-wider">{t.action.label}</Link>
                ) : (
                  <button type="button" onClick={() => { t.action?.onClick?.(); dismiss(t.id); }} className="link-underline mt-1.5 text-xs font-bold uppercase tracking-wider">{t.action.label}</button>
                ))}
              </div>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="-m-1 rounded-full p-1 text-subtle hover:text-fg"><X className="size-4" /></button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
