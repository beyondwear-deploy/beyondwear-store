import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/format";

const LOGO_W = 561;
const LOGO_H = 240;

/** BeyondWear logo mark — swaps ink color automatically with the site theme. */
export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  const label = `${siteConfig.brand.name} — ${siteConfig.brand.tagline}`;
  const imgClass = "h-8 w-auto object-contain transition-transform duration-500 ease-[var(--ease)] group-hover:scale-[1.03] sm:h-9";
  return (
    <Link href="/" onClick={onClick} aria-label={label} className={cn("group inline-flex items-center", className)}>
      <Image src="/brand/beyondwear-logo-light-theme.png" alt={label} width={LOGO_W} height={LOGO_H} priority className={cn(imgClass, "dark:hidden")} />
      <Image src="/brand/beyondwear-logo-dark-theme.png" alt={label} width={LOGO_W} height={LOGO_H} priority className={cn(imgClass, "hidden dark:block")} />
    </Link>
  );
}
