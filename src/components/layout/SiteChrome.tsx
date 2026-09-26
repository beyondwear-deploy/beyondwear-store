"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

/**
 * Renders the marketing chrome (announcement bar, navbar, footer) for every
 * page except /admin, which has its own dashboard shell (see
 * app/admin/(dashboard)/layout.tsx).
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  return (
    <>
      {!isAdminRoute && <AnnouncementBar />}
      {!isAdminRoute && <Navbar />}
      <main id="main" tabIndex={-1} className="relative outline-none">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
