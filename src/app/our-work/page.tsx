import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { ConditionBadge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { EditableText } from "@/components/edit/EditableText";
import { PROCESS } from "@/data/process";
import { CONDITIONS, cn } from "@/lib/format";

export const metadata: Metadata = {
  title: "Our Work — How We Prepare Every Pair",
  description: "From sourcing and inspection to cleaning, photography, listing and delivery: see how every preloved pair is prepared before it reaches you.",
  alternates: { canonical: "/our-work" },
};

export default function OurWorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Our work" crumbs={[{ label: "Our work" }]}
        title={<>Six steps between <em className="text-accent">closet</em> and doorstep.</>}
        blurb={<EditableText id="our-work.hero.blurb" defaultValue="Nothing is listed until it's been sourced, inspected, cleaned, photographed and described honestly. This is how it works." />}
      >
        <Button href="/shop" size="lg" arrow>Shop inspected pairs</Button>
      </PageHero>

      <section className="container-x py-16 sm:py-24" aria-label="Process timeline">
        <ol className="relative mx-auto max-w-5xl">
          <div aria-hidden className="absolute bottom-0 left-6 top-0 w-px bg-line md:left-1/2" />
          {PROCESS.map((s, i) => {
            const left = i % 2 === 0;
            return (
              <li key={s.n} className="relative mb-14 last:mb-0 md:grid md:grid-cols-2 md:gap-16">
                <span aria-hidden className="absolute left-6 top-6 z-10 grid size-12 -translate-x-1/2 place-items-center rounded-full border-2 border-accent bg-bg text-accent md:left-1/2"><s.icon className="size-5" /></span>
                <Reveal y={40} className={cn("ml-16 rounded-3xl border border-line bg-elev p-7 shadow-soft sm:p-9 md:ml-0", left ? "md:col-start-1 md:text-right" : "md:col-start-2")}>
                  <p className="font-display text-6xl text-line-strong">{s.n}</p>
                  <h2 className="mt-2 text-3xl sm:text-4xl">{s.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-accent">{s.short}</p>
                  <p className="mt-4 leading-relaxed text-muted">{s.long}</p>
                  <ul className={cn("mt-5 space-y-2 text-sm", left && "md:flex md:flex-col md:items-end")}>
                    {s.points.map((p) => <li key={p} className="flex items-center gap-2"><Check className="size-4 shrink-0 text-success" aria-hidden />{p}</li>)}
                  </ul>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </section>

      <section id="grading" className="scroll-mt-28 bg-soft py-20 sm:py-28" aria-labelledby="grade-h">
        <div className="container-x">
          <Reveal className="mb-12 max-w-2xl">
            <p className="eyebrow mb-3">Condition grading</p>
            <h2 id="grade-h" className="text-4xl sm:text-6xl"><EditableText id="our-work.grading.title" defaultValue="One scale. Every product." as="span" multiline={false} /></h2>
            <p className="mt-4 text-lg text-muted"><EditableText id="our-work.grading.blurb" defaultValue="Each pair gets a grade from this five-step scale, plus written notes on every visible mark." as="span" /></p>
          </Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CONDITIONS.map((c, i) => (
              <Reveal as="li" key={c.id} delay={i * 0.07} className="rounded-3xl border border-line bg-elev p-6">
                <ConditionBadge condition={c.id} />
                <h3 className="mt-5 text-2xl">{c.label}</h3>
                <p className="mt-2 text-sm text-muted">{c.description}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
