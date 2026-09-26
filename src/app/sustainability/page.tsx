import type { Metadata } from "next";
import { Brush, Recycle, Repeat2, Sparkles } from "lucide-react";
import { SustainabilitySection } from "@/components/home/Sections";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { EditableText } from "@/components/edit/EditableText";
import { getAllProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Sustainability",
  description: "Our approach to circular fashion: extending the life of good shoes through careful inspection, cleaning and honest resale.",
  alternates: { canonical: "/sustainability" },
};

const ACTIONS = [
  { icon: Repeat2, t: "Keep good shoes in use", d: "Pairs that are still in great shape get worn again instead of sitting unused or being discarded." },
  { icon: Brush, t: "Restore, don't replace", d: "Careful cleaning and deodorising bring pairs back to their best before they're listed." },
  { icon: Recycle, t: "Buy less, choose better", d: "Quality preloved pairs make it easier to build a shoe rack you'll actually keep." },
  { icon: Sparkles, t: "Honest claims only", d: "We don't publish unsupported environmental statistics. Numbers on this site come from our own catalogue and process." },
];

export default function SustainabilityPage() {
  return (
    <>
      <PageHero eyebrow="Sustainability" crumbs={[{ label: "Sustainability" }]} title={<>Style deserves a <em className="text-accent">second life.</em></>} blurb={<EditableText id="sustainability.hero.blurb" defaultValue="Circular fashion, kept simple: extend the life of shoes that are still good, and be honest about what that does — and doesn't — claim." />} />
      <section className="container-x py-16 sm:py-24">
        <ul className="grid gap-4 sm:grid-cols-2">
          {ACTIONS.map((a, i) => (
            <Reveal as="li" key={a.t} delay={(i % 2) * 0.08} className="flex gap-5 rounded-3xl border border-line bg-elev p-7 sm:p-9">
              <a.icon className="mt-1 size-9 shrink-0 text-accent" strokeWidth={1.4} aria-hidden />
              <div><h2 className="text-2xl">{a.t}</h2><p className="mt-2 text-sm leading-relaxed text-muted">{a.d}</p></div>
            </Reveal>
          ))}
        </ul>
        <div className="mt-12 text-center"><Button href="/shop" size="lg" arrow>Shop preloved</Button></div>
      </section>
      <SustainabilitySection listedCount={getAllProducts().length} />
    </>
  );
}
