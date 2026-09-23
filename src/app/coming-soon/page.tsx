import type { Metadata } from "next";
import { Backpack, Shirt, Wind, type LucideIcon } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { COMING_SOON, categoryLabel } from "@/lib/catalog";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: `${siteConfig.brand.name} launches with preloved shoes. Jackets, clothing, bags and accessories are coming soon — join the list to hear first.`,
  alternates: { canonical: "/coming-soon" },
};

const ICONS: Record<(typeof COMING_SOON)[number]["icon"], LucideIcon> = { outerwear: Wind, clothing: Shirt, bags: Backpack };

export default function ComingSoonPage() {
  return (
    <>
      <PageHero
        eyebrow="Coming soon"
        crumbs={[{ label: "Coming soon" }]}
        title={<>Shoes first. <em className="text-accent">More next.</em></>}
        blurb={`${siteConfig.brand.name} is launching with preloved shoes, so we can get the inspection, grading and photography exactly right. These categories follow.`}
      >
        <Button href="/shop" size="lg" arrow>Shop shoes now</Button>
        <Button href="#notify" size="lg" variant="outline">Get notified</Button>
      </PageHero>

      <section className="container-x py-16 sm:py-24" aria-label="Upcoming categories">
        <ul className="grid gap-5 lg:grid-cols-3">
          {COMING_SOON.map((g, i) => {
            const Icon = ICONS[g.icon];
            return (
              <Reveal as="li" key={g.id} delay={i * 0.08} id={g.id} className="scroll-mt-28 rounded-3xl border border-line bg-elev p-8">
                <div className="mb-8 flex items-start justify-between gap-3">
                  <Icon className="size-10 text-accent" strokeWidth={1.3} aria-hidden />
                  <Badge tone="dark">Coming soon</Badge>
                </div>
                <h2 className="text-3xl sm:text-4xl">{g.label}</h2>
                <p className="mt-2 text-sm text-muted">{g.blurb}.</p>
                <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${g.label} categories`}>
                  {g.categories.map((c) => <li key={c} className="rounded-full border border-line-strong px-3 py-1 text-xs font-semibold text-muted">{categoryLabel(c)}</li>)}
                </ul>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <section id="notify" className="container-x scroll-mt-28 pb-20 sm:pb-28" aria-labelledby="notify-h">
        <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-inverse px-6 py-14 text-inverse-fg sm:px-14 sm:py-20">
          <div aria-hidden className="absolute -left-20 -top-20 -z-10 size-96 rounded-full bg-accent/25 blur-3xl" />
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-4 !text-inverse-fg/60">Be the first to know</p>
            <h2 id="notify-h" className="text-balance text-4xl sm:text-6xl">Tell me when it opens.</h2>
            <p className="mx-auto mt-4 max-w-md text-inverse-fg/70">Leave your email and we&apos;ll message you when a new category goes live — no spam, one email per launch.</p>
            <div className="mx-auto mt-9 max-w-xl text-left"><NewsletterForm tone="dark" /></div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
