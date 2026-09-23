import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/config";

export interface Crumb { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem", position: i + 1, name: c.label,
      ...(c.href ? { item: siteConfig.brand.domain + c.href } : {}),
    })),
  };
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {c.href && i < all.length - 1 ? <Link href={c.href} className="link-underline hover:text-fg">{c.label}</Link> : <span aria-current="page" className="text-fg">{c.label}</span>}
            {i < all.length - 1 && <ChevronRight className="size-3 text-subtle" aria-hidden />}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  );
}
