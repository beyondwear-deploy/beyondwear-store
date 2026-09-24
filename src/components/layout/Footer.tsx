"use client";
import { CheckCircle2, Facebook, Instagram, MessageCircle, Music2, ShieldCheck, Sparkles, Truck, Wallet } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Honeypot, clean } from "@/components/ui/Form";
import { isEmail } from "@/lib/adapters/auth";
import { subscribeNewsletter } from "@/lib/adapters/forms";
import { siteConfig } from "@/lib/config";
import { Logo } from "./Logo";

const SHOP_LINKS = [["All Shoes", "/shop"], ["New Arrivals", "/new-arrivals"], ["Men", "/men"], ["Women", "/women"], ["Kids", "/kids"]] as const;
const HELP_LINKS = [["About Us", "/about"], ["Contact", "/contact"], ["Shipping Policy", "/policies/shipping"], ["Returns & Exchanges", "/policies/returns"], ["FAQ", "/faq"]] as const;

const TRUST = [
  { icon: ShieldCheck, title: "Inspected pair by pair", text: "Condition disclosed honestly" },
  { icon: Sparkles, title: "Cleaned & deodorised", text: "Ready to wear on arrival" },
  { icon: Truck, title: "Nationwide delivery", text: "Secure, careful packaging" },
  { icon: Wallet, title: "Cash on Delivery", text: "Pay when it arrives" },
];

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("company_website")) return; // honeypot
    const v = clean(email, 120);
    if (!isEmail(v)) { setError("Enter a valid email address."); setState("error"); return; }
    setError(""); setState("loading");
    const r = await subscribeNewsletter(v);
    if (!r.ok) { setError(r.error); setState("error"); return; }
    setState(r.duplicate ? "duplicate" : "success"); setEmail("");
  };

  if (state === "success" || state === "duplicate")
    return (
      <div role="status" className="flex items-center gap-2 rounded-lg bg-success-soft px-3.5 py-3 text-success">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden />
        <p className="text-xs font-semibold">{state === "duplicate" ? "Already on the list!" : "You're in — watch your inbox."}</p>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate>
      <Honeypot />
      <label htmlFor="footer-nl-email" className="sr-only">Email address</label>
      <input
        id="footer-nl-email" type="email" inputMode="email" autoComplete="email" value={email} maxLength={120}
        onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
        aria-invalid={state === "error"} placeholder="your@email.com"
        className="h-11 w-full rounded-lg border border-line-strong bg-soft px-4 text-sm text-fg outline-none transition placeholder:text-subtle focus:border-accent"
      />
      <button type="submit" disabled={state === "loading"} className="mt-3 flex h-11 w-full items-center justify-center rounded-lg bg-accent text-xs font-bold uppercase tracking-[0.12em] text-accent-fg transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60">
        {state === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {state === "error" && <p role="alert" className="mt-2 text-xs font-medium text-danger">{error}</p>}
    </form>
  );
}

export function Footer() {
  const s = siteConfig.socials;
  const social = [
    { ...s.instagram, icon: Instagram }, { ...s.facebook, icon: Facebook }, { ...s.tiktok, icon: Music2 }, { ...s.whatsapp, icon: MessageCircle },
  ];
  return (
    <footer className="mt-24 border-t-2 border-accent bg-elev text-fg">
      <div className="container-x">
        <ul className="grid grid-cols-2 gap-6 border-b border-line py-10 lg:grid-cols-4">
          {TRUST.map((t) => (
            <li key={t.title} className="flex items-start gap-3">
              <t.icon className="mt-0.5 size-6 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
              <div><p className="text-sm font-semibold">{t.title}</p><p className="text-xs opacity-60">{t.text}</p></div>
            </li>
          ))}
        </ul>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed opacity-70">{siteConfig.brand.description}</p>
            <div className="mt-5 flex items-center gap-3">
              {social.map((x) => (
                <a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer" aria-label={`${x.label} (opens in a new tab)`}
                  className="grid size-9 place-items-center rounded-full border border-line-strong transition hover:border-accent hover:text-accent">
                  <x.icon className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Shop">
            <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Shop</h2>
            <ul className="space-y-3 text-sm">
              {SHOP_LINKS.map(([label, href]) => (
                <li key={label}><Link href={href} className="link-underline opacity-80 transition-opacity hover:opacity-100">{label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Help</h2>
            <ul className="space-y-3 text-sm">
              {HELP_LINKS.map(([label, href]) => (
                <li key={label}><Link href={href} className="link-underline opacity-80 transition-opacity hover:opacity-100">{label}</Link></li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">Stay in the loop</h2>
            <p className="mb-4 text-sm opacity-70">Get first access to new drops and exclusive deals.</p>
            <FooterNewsletter />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 text-xs opacity-70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.brand.name} · {siteConfig.brand.domain.replace(/^https?:\/\//, "")} · All rights reserved.</p>
          <p className="flex gap-4">
            <Link href="/policies/privacy" className="link-underline">Privacy Policy</Link>
            <Link href="/policies/terms" className="link-underline">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
