"use client";
import { motion } from "framer-motion";
import { Heart, Package, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { NAV_LINKS, siteConfig } from "@/lib/config";
import { cn } from "@/lib/format";
import { useUI } from "@/store";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function MobileMenu() {
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const pathname = usePathname();
  const close = () => setOpen(false);
  const secondary = [
    { href: "/account", label: "Account", icon: User },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    { href: "/track-order", label: "Track order", icon: Package },
  ];
  return (
    <Modal open={open} onClose={close} title="Menu" hideTitle variant="left">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <Logo onClick={close} />
        <button type="button" onClick={close} aria-label="Close menu" className="tap grid place-items-center rounded-full hover:bg-soft"><X className="size-6" /></button>
      </div>
      <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
        <ul className="space-y-1">
          {NAV_LINKS.map((l, i) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <motion.li key={l.href} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                <Link href={l.href} onClick={close} aria-current={active ? "page" : undefined} className={cn("group flex items-baseline gap-4 border-b border-line/70 py-3.5 font-display text-4xl transition-colors", active ? "text-accent" : "hover:text-accent")}>
                  <span className="w-6 font-sans text-[10px] font-bold tracking-widest text-subtle">0{i + 1}</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-2">{l.label}</span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
        <div className="mt-8 grid grid-cols-3 gap-2">
          {secondary.map((s) => (
            <Link key={s.href} href={s.href} onClick={close} className="flex flex-col items-center gap-2 rounded-2xl bg-soft px-2 py-4 text-[11px] font-bold uppercase tracking-wider transition active:scale-95"><s.icon className="size-5" aria-hidden />{s.label}</Link>
          ))}
        </div>
      </nav>
      <div className="flex items-center justify-between border-t border-line px-5 py-4">
        <ul className="flex gap-4 text-xs font-semibold uppercase tracking-wider text-muted">
          {[siteConfig.socials.instagram, siteConfig.socials.tiktok, siteConfig.socials.whatsapp].map((s) => (
            <li key={s.label}><a href={s.url} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-fg">{s.label}</a></li>
          ))}
        </ul>
        <ThemeToggle />
      </div>
    </Modal>
  );
}
