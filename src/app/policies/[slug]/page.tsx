import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { POLICIES, getPolicy } from "@/data/policies";
import { cn } from "@/lib/format";

export const dynamicParams = false;
export const generateStaticParams = () => POLICIES.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPolicy((await params).slug);
  if (!p) return {};
  return { title: p.title, description: p.summary, alternates: { canonical: `/policies/${p.slug}` } };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <>
      <PageHero eyebrow={`Updated ${policy.updated}`} crumbs={[{ label: "Policies", href: "/policies" }, { label: policy.title }]} title={policy.title} blurb={policy.summary} />
      <div className="container-x grid gap-12 py-14 sm:py-20 lg:grid-cols-[240px_1fr] lg:gap-20">
        <nav aria-label="Policies" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:sticky lg:top-28 lg:mx-0 lg:h-fit lg:flex-col lg:gap-1 lg:px-0">
          {POLICIES.map((p) => (
            <Link key={p.slug} href={`/policies/${p.slug}`} aria-current={p.slug === slug ? "page" : undefined} className={cn("shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors lg:rounded-xl", p.slug === slug ? "bg-fg text-bg" : "text-muted hover:bg-soft hover:text-fg")}>{p.title}</Link>
          ))}
        </nav>
        <article className="max-w-3xl">
          {policy.sections.map((s, i) => (
            <section key={s.heading} className="mb-10">
              <h2 className="mb-3 text-2xl sm:text-3xl"><span className="mr-3 font-display text-line-strong">{String(i + 1).padStart(2, "0")}</span>{s.heading}</h2>
              {s.body.map((b, j) => <p key={j} className="mb-3 leading-relaxed text-muted">{b}</p>)}
            </section>
          ))}
          <p className="mt-12 rounded-2xl bg-soft p-5 text-xs leading-relaxed text-subtle">These policies are a starting draft and not legal advice. Have them reviewed against local consumer-protection law before launch. Questions? <Link href="/contact" className="underline">Contact us</Link>.</p>
        </article>
      </div>
    </>
  );
}
