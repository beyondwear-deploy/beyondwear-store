import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/format";

/** BeyondWear logo mark — inline sneaker glyph + wordmark, fully theme-reactive (no raster assets). */
export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  const label = `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`;
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={label}
      className={cn("group inline-flex items-center gap-2 transition-transform duration-500 ease-[var(--ease)] hover:scale-[1.03] sm:gap-2.5", className)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 shrink-0 transition-transform duration-500 ease-[var(--ease)] group-hover:-translate-y-0.5 sm:h-7 sm:w-7"
        aria-hidden="true"
      >
        <path d="m15 10.42 4.8-5.07" />
        <path d="M19 18h3" />
        <path d="M9.5 22 21.414 9.415A2 2 0 0 0 21.2 6.4l-5.61-4.208A1 1 0 0 0 14 3v2a2 2 0 0 1-1.394 1.906L8.677 8.053A1 1 0 0 0 8 9c-.155 6.393-2.082 9-4 9a2 2 0 0 0 0 4h14" />
      </svg>
      <span className="font-display text-[20px] font-bold uppercase leading-none tracking-[0.01em] text-fg sm:text-[22px]">
        Beyond<span className="text-accent">Wear</span>
      </span>
    </Link>
  );
}
