import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/format";

/** BeyondWear logo mark — official brand badge (raster) + wordmark. */
export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  const label = `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`;
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={label}
      className={cn("group inline-flex items-center gap-2 transition-transform duration-500 ease-[var(--ease)] hover:scale-[1.03] sm:gap-2.5", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.jpg"
        alt=""
        className="h-8 w-8 shrink-0 rounded-full object-cover transition-transform duration-500 ease-[var(--ease)] group-hover:-translate-y-0.5 sm:h-9 sm:w-9"
        aria-hidden="true"
      />
      <span className="font-display text-[20px] font-bold uppercase leading-none tracking-[0.01em] text-fg sm:text-[22px]">
        Beyond<span className="text-accent">Wear</span>
      </span>
    </Link>
  );
}
