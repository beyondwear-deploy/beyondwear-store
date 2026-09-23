import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { POLICIES } from "@/data/policies";

export const metadata: Metadata = { title: "Store Policies", description: "Shipping, returns, refunds, privacy and terms.", alternates: { canonical: "/policies" } };

export default function PoliciesIndex() {
  return (
    <>
      <PageHero eyebrow="Policies" crumbs={[{ label: "Policies" }]} title="Store policies." blurb="Clear rules for shipping, returns, refunds, privacy and terms." />
      <ul className="container-x grid gap-4 py-16 sm:grid-cols-2 sm:py-24 lg:grid-cols-3">
        {POLICIES.map((p) => (
          <li key={p.slug}>
            <Link href={`/policies/${p.slug}`} className="group flex h-full flex-col justify-between rounded-3xl border border-line bg-elev p-7 transition duration-500 hover:-translate-y-1 hover:shadow-card">
              <div><h2 className="text-2xl">{p.title}</h2><p className="mt-2 text-sm text-muted">{p.summary}</p></div>
              <span className="mt-8 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em]">Read policy <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
