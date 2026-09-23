import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/format";
import { Reveal } from "./Reveal";

export function SectionHeading({ eyebrow, title, blurb, href, hrefLabel = "View all", align = "left", className }: {
  eyebrow?: string; title: string; blurb?: string; href?: string; hrefLabel?: string; align?: "left" | "center"; className?: string;
}) {
  return (
    <Reveal className={cn("mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between", align === "center" && "items-center text-center sm:flex-col sm:items-center", className)}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-3 flex items-center gap-3">{align === "left" && <span className="h-px w-8 bg-accent" aria-hidden />}{eyebrow}</p>}
        <h2 className="text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h2>
        {blurb && <p className="mt-4 text-base text-muted sm:text-lg">{blurb}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] hover:text-accent">
          <span className="link-underline">{hrefLabel}</span>
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </Reveal>
  );
}
