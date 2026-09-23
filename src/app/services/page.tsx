import type { Metadata } from "next";
import { Camera, ClipboardCheck, Footprints, HandCoins, MessageCircle, PackageCheck, Store } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Services",
  description: "Curated preloved shoes, inspection and authenticity checks, detailed photography, nationwide delivery and studio pickup.",
  alternates: { canonical: "/services" },
};

const SERVICES = [
  { icon: Footprints, t: "Curated preloved shoes", d: "A tightly edited catalogue of sneakers, boots and everyday pairs — hand-picked, never bulk-listed. Clothing and bags are coming soon." },
  { icon: ClipboardCheck, t: "Inspection & authenticity review", d: "Every pair is checked for condition and, where relevant, reviewed against label, stitching and sole details." },
  { icon: Camera, t: "Detailed photography", d: "Side, back, labels, soles and close-ups of any wear so you can inspect before you buy." },
  { icon: PackageCheck, t: "Nationwide delivery", d: "Careful packaging and courier delivery, Cash on Delivery available, live order tracking." },
  { icon: MessageCircle, t: "Personal styling help", d: "Unsure about fit or condition? Message us on WhatsApp and we'll share extra photos, insole measurements or suggestions." },
  { icon: Store, t: "Studio pickup", d: "Prefer to see it in person? Book an appointment and collect from the studio." },
];

export default function ServicesPage() {
  const wa = `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent("Hi! I'd like to know more about selling / consigning with you.")}`;
  return (
    <>
      <PageHero eyebrow="Services" crumbs={[{ label: "Services" }]} title={<>More than a shop, <em className="text-accent">a process.</em></>} blurb="Everything we do is designed to make buying preloved shoes as easy and trustworthy as buying new." />
      <section className="container-x py-16 sm:py-24">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal as="li" key={s.t} delay={(i % 3) * 0.08} className="group rounded-3xl border border-line bg-elev p-8 transition duration-500 hover:-translate-y-1 hover:shadow-card">
              <s.icon className="mb-6 size-9 text-accent transition-transform duration-500 group-hover:scale-110" strokeWidth={1.4} aria-hidden />
              <h2 className="text-2xl">{s.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="container-x pb-20 sm:pb-28" aria-labelledby="consign-h">
        <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-secondary p-8 text-secondary-fg sm:p-14">
          <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-white/10 blur-3xl" />
          <Badge tone="accent" className="mb-5">Coming soon</Badge>
          <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 id="consign-h" className="flex items-center gap-3 text-4xl sm:text-6xl"><HandCoins className="hidden size-10 text-accent sm:block" aria-hidden />Sell or consign with us</h2>
              <p className="mt-5 max-w-xl text-lg text-secondary-fg/80">Have quality shoes that deserve a second home? We&apos;re planning a consignment service. Tell us what you have and we&apos;ll get in touch when it opens.</p>
              <p className="mt-3 text-xs text-secondary-fg/60">Placeholder service — terms, commission and process to be defined by the store owner.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button href="/contact?subject=Sell%20or%20consign%20with%20us" variant="inverse" size="lg" arrow>Register interest</Button>
              <Button href={wa} target="_blank" rel="noopener noreferrer" variant="outline" size="lg" className="!border-white/40 !text-secondary-fg hover:!bg-white hover:!text-primary">WhatsApp us</Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
