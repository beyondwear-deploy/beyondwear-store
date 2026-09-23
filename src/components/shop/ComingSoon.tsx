import { ArrowRight, Backpack, Shirt, Wind, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { COMING_SOON } from "@/lib/catalog";
import { cn } from "@/lib/format";

const ICONS: Record<(typeof COMING_SOON)[number]["icon"], LucideIcon> = { outerwear: Wind, clothing: Shirt, bags: Backpack };

/** Professional "Coming soon" tiles for the categories that are not live yet. */
export function ComingSoonStrip({ heading = true, className }: { heading?: boolean; className?: string }) {
  return (
    <section className={cn("container-x", className)} aria-labelledby="soon-h">
      {heading ? (
        <SectionHeading eyebrow="Coming soon" title="More to come." blurb="We're starting with shoes and doing them properly. These categories are next." href="/coming-soon" hrefLabel="Get notified" />
      ) : (
        <h2 id="soon-h" className="sr-only">Coming soon</h2>
      )}
      <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {COMING_SOON.map((g, i) => {
          const Icon = ICONS[g.icon];
          return (
            <Reveal as="li" key={g.id} delay={i * 0.08}>
              <Link href={`/coming-soon#${g.id}`} className="group relative flex h-full min-h-[190px] flex-col justify-between overflow-hidden rounded-3xl border border-dashed border-line-strong bg-soft/60 p-6 transition duration-500 hover:-translate-y-1 hover:border-fg hover:bg-elev hover:shadow-card sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <Icon className="size-9 text-muted transition-colors duration-500 group-hover:text-accent" strokeWidth={1.3} aria-hidden />
                  <Badge tone="dark">Coming soon</Badge>
                </div>
                <div className="mt-8">
                  <h3 className="text-3xl">{g.label}</h3>
                  <p className="mt-1 text-sm text-muted">{g.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-muted transition-colors group-hover:text-fg">Get notified <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden /></span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

/** Shown in the shop when the URL asks for a category that is not live yet (e.g. /shop?category=jackets). */
export function ComingSoonPanel({ label, blurb }: { label: string; blurb: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-line-strong bg-soft/60 px-6 py-14 text-center sm:px-10" role="status">
      <Badge tone="dark">Coming soon</Badge>
      <h2 className="mt-5 text-4xl sm:text-5xl">{label} are on the way.</h2>
      <p className="mx-auto mt-4 max-w-sm text-muted">{blurb}. We&apos;re launching with shoes first — join the list and we&apos;ll tell you the moment this opens.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/shop" size="lg" arrow>Shop shoes</Button>
        <Button href="/coming-soon#notify" size="lg" variant="outline">Get notified</Button>
      </div>
    </div>
  );
}
