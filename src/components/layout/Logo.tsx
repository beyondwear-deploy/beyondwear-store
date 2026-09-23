import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/format";
import { LOGO } from "./logo-paths";

/** Sequel Closet logo: echo "S" mark + SEQUEL / CLOSET wordmark (outlined paths, themes with the site). */
export function Logo({ className, onClick, invert }: { className?: string; onClick?: () => void; invert?: boolean }) {
  return (
    <Link href="/" onClick={onClick} aria-label={`${siteConfig.brand.name} — home`} className={cn("group inline-flex items-center", invert && "text-inverse-fg", className)}>
      <svg viewBox={`0 0 ${LOGO.W} ${LOGO.H}`} className="h-11 w-auto sm:h-12" aria-hidden focusable="false">
        <g transform={`scale(${LOGO.ISZ / 100})`}>
          <path d={LOGO.markBack} fill="var(--accent)" className="transition-transform duration-500 ease-[var(--ease)] group-hover:translate-x-[3px] group-hover:translate-y-[3px]" />
          <path d={LOGO.markFront} fill="currentColor" />
        </g>
        <g transform={`translate(${LOGO.TX} 0)`}>
          <path d={LOGO.word} fill="currentColor" />
          <rect x={LOGO.RULE_X} y={LOGO.RULE_Y} width={LOGO.RULE_W} height="1.2" fill="var(--accent)" />
          <path d={LOGO.closet} fill="currentColor" opacity=".8" />
        </g>
      </svg>
    </Link>
  );
}
