"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Thin accent bar that sweeps on every route change. */
export function RouteProgress() {
  const pathname = usePathname();
  const first = useRef(true);
  const [key, setKey] = useState(0);
  useEffect(() => { if (first.current) { first.current = false; return; } setKey((k) => k + 1); }, [pathname]);
  if (!key) return null;
  return <div key={key} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[300] h-0.5 origin-left bg-accent" style={{ animation: "route-progress 0.9s var(--ease) forwards" }} />;
}
