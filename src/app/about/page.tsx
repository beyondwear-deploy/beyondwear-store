import type { Metadata } from "next";
import { Eye, Gem, Leaf, Sparkles } from "lucide-react";
import { ProcessStrip, WhyPreloved } from "@/components/home/Sections";
import { PageHero } from "@/components/layout/PageHero";
import { ProductArt } from "@/components/art/ProductArt";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Us",
  description: `${siteConfig.brand.name} is a preloved shoe store built on honest condition grading, careful inspection and detailed photography.`,
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: Eye, t: "Radical transparency", d: "Five-grade condition system, written notes on every mark, exact measurements and close-up photos of any wear." },
  { icon: Gem, t: "Quality first", d: "We only list pairs with real life left in them — checked sole to lining, stitch by stitch." },
  { icon: Sparkles, t: "Curated, not bulk", d: "Every pair is hand-picked for design, brand and wearability. If we wouldn't wear it, we don't list it." },
  { icon: Leaf, t: "A second life", d: "Extending the life of good shoes is the simplest, most stylish thing you can do for the planet." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us" crumbs={[{ label: "About" }]}
        title={<>Shoes with a <em className="text-accent">second chapter.</em></>}
        blurb={`${siteConfig.brand.name} is a home for carefully selected preloved shoes — inspected, cleaned and photographed in detail, and presented with the honesty and polish you'd expect from new. Clothing and bags are coming soon.`}
      >
        <Button href="/shop" size="lg" arrow>Shop the collection</Button>
        <Button href="/our-work" size="lg" variant="outline">How we work</Button>
      </PageHero>

      <section className="container-x grid gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <p className="eyebrow mb-4">Our story</p>
          <h2 className="text-balance text-4xl leading-[1.05] sm:text-6xl">Good shoes shouldn&apos;t be thrown away.</h2>
        </Reveal>
        <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-muted">
          <p>We started with a simple frustration: preloved shopping is full of great pairs, but also full of blurry photos, vague descriptions and guesswork.</p>
          <p>So we built the store we wanted to shop at. Every pair is inspected in person, cleaned and prepared, then photographed from every angle — including the flaws — and described in plain language with real measurements.</p>
          <p>The result: you can buy preloved with the same confidence as buying new, and every pair gets to keep going.</p>
          <p className="border-l-2 border-accent pl-4 text-sm text-subtle">Editor&apos;s note: this story is placeholder copy. Replace it with your own founding story in <code>src/app/about/page.tsx</code>.</p>
        </Reveal>
      </section>

      <section className="container-x pb-20 sm:pb-28" aria-labelledby="name-h">
        <Reveal className="rounded-[2rem] border border-line bg-elev p-8 sm:p-14">
          <p className="eyebrow mb-4">The name</p>
          <h2 id="name-h" className="text-balance text-4xl leading-[1.05] sm:text-6xl">What &ldquo;BeyondWear&rdquo; means.</h2>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted sm:text-2xl">{siteConfig.brand.meaning}</p>
          <p className="mt-4 max-w-2xl text-base text-muted">{siteConfig.brand.story}</p>
        </Reveal>
      </section>

      <section className="bg-soft py-20 sm:py-28" aria-labelledby="values-h">
        <div className="container-x">
          <Reveal className="mb-12 max-w-2xl"><p className="eyebrow mb-3">What we stand for</p><h2 id="values-h" className="text-4xl sm:text-6xl">Four promises.</h2></Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal as="li" key={v.t} delay={i * 0.08} className="rounded-3xl border border-line bg-elev p-7">
                <v.icon className="mb-6 size-8 text-accent" strokeWidth={1.4} aria-hidden />
                <h3 className="text-2xl">{v.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-x py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem]">
            <div className="h-full w-full" style={{ background: "var(--art-bg-b)" }}>
              <ProductArt art={{ garment: "sneaker", color: "#e4d9c1", color2: "#3d3c39", variant: 1 }} view="side" alt="Illustration of a sneaker" decorative className="h-full w-full" meta={{ brand: "", size: "", material: "", wearNote: "" }} />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow mb-4">Honest by design</p>
            <h2 className="text-balance text-4xl sm:text-6xl">What you see is what arrives.</h2>
            <p className="mt-6 text-lg text-muted">Every listing shows the side, back, labels, soles and close-ups of any wear. Condition is graded on one consistent scale, so a &ldquo;Good&rdquo; means the same thing on every product.</p>
            <Button href="/our-work#grading" variant="outline" className="mt-8" arrow>Our condition grades</Button>
          </Reveal>
        </div>
      </section>

      <WhyPreloved />
      <ProcessStrip />
    </>
  );
}
