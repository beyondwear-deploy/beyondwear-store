import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactClient } from "@/components/contact/ContactClient";
import { PageHero } from "@/components/layout/PageHero";
import { Skeleton } from "@/components/ui/LoadingState";

export const metadata: Metadata = {
  title: "Contact",
  description: "Message us, chat on WhatsApp or ask a question about a product. We usually reply the same day.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" crumbs={[{ label: "Contact" }]} title={<>Let&apos;s <em className="text-accent">talk.</em></>} blurb="Questions about a pair, an order, or working together — we're happy to help." />
      <Suspense fallback={<div className="container-x py-16"><Skeleton className="h-96 rounded-3xl" /></div>}>
        <ContactClient />
      </Suspense>
    </>
  );
}
