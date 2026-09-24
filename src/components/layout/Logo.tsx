import Link from "next/link";
import { Feather } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/format";

/** BeyondWear logo: feather mark + bold condensed "BEYOND WEAR" wordmark. */
export function Logo({ className, onClick, invert }: { className?: string; onClick?: () => void; invert?: boolean }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${siteConfig.brand.name} — home`}
      className={cn("group inline-flex items-center gap-2 sm:gap-2.5", invert && "text-inverse-fg", className)}
    >
      <Feather
        className="size-6 -scale-x-100 shrink-0 text-accent transition-transform duration-500 ease-[var(--ease)] group-hover:rotate-[8deg] sm:size-7"
        strokeWidth={2}
        aria-hidden
      />
      <span
        className="text-xl font-semibold uppercase leading-none tracking-tight sm:text-2xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Beyond&nbsp;Wear
      </span>
    </Link>
  );
}
