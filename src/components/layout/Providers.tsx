"use client";
import { MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { EditModeProvider } from "@/components/edit/EditModeContext";
import { EditModeToggle } from "@/components/edit/EditModeToggle";
import { QuickView } from "@/components/product/QuickView";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { Toaster } from "@/components/ui/Toaster";
import { hydrateStores, useUI } from "@/store";
import { MobileMenu } from "./MobileMenu";
import { RouteProgress } from "./RouteProgress";
import { SearchOverlay } from "./SearchOverlay";

export function Providers({
  children, isAdmin = false, contentOverrides = {},
}: {
  children: ReactNode; isAdmin?: boolean; contentOverrides?: Record<string, string>;
}) {
  const pathname = usePathname();
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  useEffect(() => { hydrateStores(); }, []);

  // close overlays on navigation
  useEffect(() => {
    const ui = useUI.getState();
    ui.setMenuOpen(false); ui.setCartOpen(false); ui.setSearchOpen(false); ui.setQuickView(null);
  }, [pathname]);

  // global shortcuts: "/" or Ctrl/⌘+K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  return (
    <EditModeProvider isAdmin={isAdmin} initialOverrides={contentOverrides}>
      <MotionConfig reducedMotion="user">
        <PageViewTracker />
        <RouteProgress />
        {children}
        <SearchOverlay />
        <CartDrawer />
        <MobileMenu />
        <QuickView />
        <SizeGuideModal />
        <Toaster />
        <EditModeToggle />
      </MotionConfig>
    </EditModeProvider>
  );
}
