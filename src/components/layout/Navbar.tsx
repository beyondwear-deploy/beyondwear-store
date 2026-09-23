"use client";
import { motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconButton } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/config";
import { cn } from "@/lib/format";
import { useAuth, useCart, useReady, useUI, useWishlist } from "@/store";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const ready = useReady();
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const bump = useUI((s) => s.cartBump);
  const cartCount = useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const user = useAuth((s) => s.user);
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setScrolled(window.scrollY > 24)); };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  useEffect(() => { if (!bump) return; setBumping(true); const t = setTimeout(() => setBumping(false), 600); return () => clearTimeout(t); }, [bump]);

  return (
    <header className={cn("sticky top-0 z-50 w-full transition-all duration-500 ease-[var(--ease)]", scrolled ? "glass shadow-soft" : "border-b border-transparent bg-bg/0")}>
      <div className={cn("container-x flex items-center justify-between gap-4 transition-all duration-500 ease-[var(--ease)]", scrolled ? "h-16" : "h-[72px] sm:h-20")}>
        <div className="flex items-center gap-2">
          <IconButton label="Open menu" onClick={() => setMenuOpen(true)} className="-ml-2 xl:hidden" aria-haspopup="dialog"><Menu className="size-6" /></IconButton>
          <Logo />
        </div>

        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href} className="relative">
                  <Link href={l.href} aria-current={active ? "page" : undefined} className={cn("group relative block px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors", active ? "text-fg" : "text-muted hover:text-fg")}>
                    {l.label}
                    <span aria-hidden className="absolute inset-x-3.5 bottom-0.5 h-px origin-left scale-x-0 bg-fg transition-transform duration-500 ease-[var(--ease)] group-hover:scale-x-100" />
                  </Link>
                  {active && <motion.span layoutId="nav-active" aria-hidden className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-accent" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <IconButton label="Search" onClick={() => setSearchOpen(true)} aria-haspopup="dialog"><Search className="size-5" /></IconButton>
          <ThemeToggle />
          <Link href="/account" aria-label={ready && user ? "My account" : "Sign in or register"} className="tap hidden items-center justify-center rounded-full transition hover:bg-soft active:scale-90 sm:inline-flex"><User className="size-5" /></Link>
          <Link href="/wishlist" aria-label={`Wishlist${ready && wishCount ? `, ${wishCount} items` : ""}`} className="tap relative hidden items-center justify-center rounded-full transition hover:bg-soft active:scale-90 sm:inline-flex">
            <Heart className="size-5" />
            {ready && wishCount > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold leading-4 text-accent-fg">{wishCount}</span>}
          </Link>
          <button type="button" onClick={() => setCartOpen(true)} aria-label={`Shopping bag${ready && cartCount ? `, ${cartCount} items` : ""}`} aria-haspopup="dialog" className="tap relative inline-flex items-center justify-center rounded-full transition hover:bg-soft active:scale-90">
            <ShoppingBag className={cn("size-5", bumping && "bump")} />
            {ready && cartCount > 0 && <span className={cn("absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold leading-4 text-accent-fg", bumping && "bump")}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
