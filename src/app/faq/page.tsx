import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { EditableText } from "@/components/edit/EditableText";
import { FAQ } from "@/data/faq";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about preloved condition, authenticity, measurements, payment, Cash on Delivery, delivery times, returns and exchanges.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.flatMap((g) => g.items).map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return (
    <>
      <PageHero eyebrow="FAQ" crumbs={[{ label: "FAQ" }]} title={<>Questions, <em className="text-accent">answered.</em></>} blurb={<EditableText id="faq.hero.blurb" defaultValue="Everything about condition, sizing, payment and delivery. Can't find it? Ask us." />} />
      <div className="container-x grid gap-14 py-16 sm:py-24 lg:grid-cols-[1fr_320px]">
        <div className="space-y-14">
          {FAQ.map((g, gi) => (
            <section key={g.title} aria-labelledby={`faq-${gi}`}>
              <h2 id={`faq-${gi}`} className="mb-4 text-3xl sm:text-4xl">{g.title}</h2>
              <Accordion items={g.items.map((i) => ({ q: i.q, a: i.a }))} defaultOpen={gi === 0 ? 0 : null} />
            </section>
          ))}
        </div>
        <aside className="h-fit rounded-3xl bg-soft p-7 lg:sticky lg:top-28">
          <h2 className="text-2xl"><EditableText id="faq.aside.title" defaultValue="Still have a question?" as="span" multiline={false} label="FAQ sidebar heading" /></h2>
          <p className="mt-2 text-sm text-muted"><EditableText id="faq.aside.blurb" defaultValue="We usually reply the same day." as="span" multiline={false} label="FAQ sidebar note" /></p>
          <div className="mt-6 flex flex-col gap-3">
            <Button href={`https://wa.me/${siteConfig.contact.whatsappNumber}`} target="_blank" rel="noopener noreferrer" variant="accent" icon={<MessageCircle className="size-4" />}>WhatsApp us</Button>
            <Button href="/contact" variant="outline">Send a message</Button>
          </div>
        </aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
