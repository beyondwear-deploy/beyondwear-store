import { Facebook, Instagram, MessageCircle, Music2, ShieldCheck, Sparkles, Truck, Wallet } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { Logo } from "./Logo";

const COLS = [
  { title: "Shop", links: [["Men's Shoes", "/men"], ["Women's Shoes", "/women"], ["Kids' Shoes", "/kids"], ["All Shoes", "/shop"], ["New Arrivals", "/new-arrivals"], ["Coming Soon", "/coming-soon"]] },
  { title: "Information", links: [["About", "/about"], ["Our Work", "/our-work"], ["Services", "/services"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Size Guide", "/size-guide"]] },
  { title: "Customer Care", links: [["Track Order", "/track-order"], ["Shipping", "/policies/shipping"], ["Returns", "/policies/returns"], ["Refunds", "/policies/refunds"], ["Terms & Conditions", "/policies/terms"], ["Privacy Policy", "/policies/privacy"]] },
] as const;

const TRUST = [
  { icon: ShieldCheck, title: "Inspected pair by pair", text: "Condition disclosed honestly" },
  { icon: Sparkles, title: "Cleaned & deodorised", text: "Ready to wear on arrival" },
  { icon: Truck, title: "Nationwide delivery", text: "Secure, careful packaging" },
  { icon: Wallet, title: "Cash on Delivery", text: "Pay when it arrives" },
];

export function Footer() {
  const s = siteConfig.socials;
  const social = [
    { ...s.instagram, icon: Instagram }, { ...s.facebook, icon: Facebook }, { ...s.tiktok, icon: Music2 }, { ...s.whatsapp, icon: MessageCircle },
  ];
  return (
    <footer className="mt-24 bg-inverse text-inverse-fg">
      <div className="container-x">
        <ul className="grid grid-cols-2 gap-6 border-b border-white/10 py-10 lg:grid-cols-4 [html[data-theme=dark]_&]:border-black/10">
          {TRUST.map((t) => (
            <li key={t.title} className="flex items-start gap-3">
              <t.icon className="mt-0.5 size-6 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
              <div><p className="text-sm font-semibold">{t.title}</p><p className="text-xs opacity-60">{t.text}</p></div>
            </li>
          ))}
        </ul>
        <div className="grid gap-12 py-14 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo invert />
            <p className="mt-5 text-sm font-semibold opacity-90">{siteConfig.brand.tagline}</p>
            <p className="mt-2 text-sm leading-relaxed opacity-70">{siteConfig.brand.meaning}</p>
          </div>
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="mb-5 !font-sans text-[11px] font-bold uppercase !tracking-[0.2em] opacity-60">{c.title}</h2>
              <ul className="space-y-3 text-sm">
                {c.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className="link-underline opacity-90 transition-opacity hover:opacity-100">{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <h2 className="mb-5 !font-sans text-[11px] font-bold uppercase !tracking-[0.2em] opacity-60">Follow us</h2>
            <ul className="space-y-3 text-sm">
              {social.map((x) => (
                <li key={x.label}>
                  <a href={x.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2.5 opacity-90 transition-opacity hover:opacity-100">
                    <x.icon className="size-4" aria-hidden /><span className="link-underline">{x.label}</span><span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs opacity-70 sm:flex-row sm:items-center sm:justify-between [html[data-theme=dark]_&]:border-black/10">
          <p>© 2026 {siteConfig.brand.name.toUpperCase()}. ALL RIGHTS RESERVED.</p>
          <p>Cash on Delivery · Bank Transfer · Online Payment</p>
        </div>
      </div>
    </footer>
  );
}
