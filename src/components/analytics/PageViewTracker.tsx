"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

/**
 * Fires a lightweight, anonymous pageview beacon to /api/track on every
 * route change. Powers the Traffic tab of the admin dashboard. No cookies
 * with personal data — just a random visitor id (see api/track/route.ts).
 */
function Beacon() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return; // don't count the owner's own dashboard visits
    const path = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    const body = JSON.stringify({ path, referrer: document.referrer || "" });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      }
    } catch {
      // analytics must never break the page
    }
  }, [pathname, searchParams]);

  return null;
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <Beacon />
    </Suspense>
  );
}
