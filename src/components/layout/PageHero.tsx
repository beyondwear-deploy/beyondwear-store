import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";

/** Shared header for content pages (About, Our Work, FAQ, policies …). */
export function PageHero({ eyebrow, title, blurb, crumbs, children }: { eyebrow: string; title: ReactNode; blurb?: ReactNode; crumbs: Crumb[]; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <div aria-hidden className="absolute -right-32 -top-32 -z-10 size-[28rem] rounded-full bg-accent/12 blur-[110px]" />
      <div className="container-x pb-12 pt-6 sm:pb-20 sm:pt-8">
        <Breadcrumbs items={crumbs} />
        <p className="eyebrow mb-4 mt-10 flex items-center gap-3 sm:mt-14"><span className="h-px w-8 bg-accent" aria-hidden />{eyebrow}</p>
        <h1 className="max-w-4xl text-balance text-5xl leading-[0.98] sm:text-7xl lg:text-8xl">{title}</h1>
        {blurb && <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">{blurb}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}
