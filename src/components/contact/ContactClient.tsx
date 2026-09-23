"use client";
import { CheckCircle2, Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Music2, Phone } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { clean, Honeypot, SelectField, TextAreaField, TextField } from "@/components/ui/Form";
import { isEmail, isPhone } from "@/lib/adapters/auth";
import { sendContactMessage } from "@/lib/adapters/forms";
import { getProductBySlug } from "@/lib/catalog";
import { siteConfig } from "@/lib/config";

const SUBJECTS = ["General enquiry", "Question about a product", "Order or delivery", "Returns & exchanges", "Sell or consign with us", "Wholesale / collaboration"];
type Errors = Partial<Record<"name" | "email" | "phone" | "message", string>> & { form?: string };

export function ContactClient() {
  const sp = useSearchParams();
  const product = sp.get("product") ? getProductBySlug(sp.get("product")!) : undefined;
  const wantedSubject = sp.get("subject") ?? (product ? "Question about a product" : "General enquiry");
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    subject: SUBJECTS.includes(wantedSubject) ? wantedSubject : "General enquiry",
    message: product ? `Hi! I have a question about the ${product.brand} ${product.name} (size ${product.size}, ${product.sku}).\n\n` : "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const set = (k: keyof typeof form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined, form: undefined })); };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((new FormData(e.currentTarget).get("company_website") as string)?.length) return;
    const er: Errors = {};
    if (clean(form.name, 80).length < 2) er.name = "Please enter your name.";
    if (!isEmail(form.email)) er.email = "Enter a valid email address.";
    if (form.phone.trim() && !isPhone(form.phone)) er.phone = "Enter a valid phone number.";
    if (clean(form.message, 2000).length < 10) er.message = "Please write at least a short message (10+ characters).";
    setErrors(er);
    if (Object.keys(er).length) return;
    setState("loading");
    const r = await sendContactMessage({ name: clean(form.name, 80), email: clean(form.email, 120), phone: clean(form.phone, 20) || undefined, subject: form.subject, message: clean(form.message, 2000), productRef: product?.sku });
    if (!r.ok) { setErrors({ form: r.error }); setState("idle"); return; }
    setState("sent");
  };

  const c = siteConfig.contact;
  const wa = `https://wa.me/${c.whatsappNumber}?text=${encodeURIComponent(product ? `Hi! I have a question about ${product.brand} ${product.name} (${product.sku}).` : "Hi! I have a question.")}`;
  const socials = [
    { ...siteConfig.socials.instagram, icon: Instagram }, { ...siteConfig.socials.facebook, icon: Facebook }, { ...siteConfig.socials.tiktok, icon: Music2 },
  ];

  return (
    <div className="container-x grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
      <div>
        <h2 className="mb-2 text-3xl sm:text-4xl">{product ? "Have a question about this product?" : "Send us a message"}</h2>
        {product && <p className="mb-6 rounded-2xl bg-soft px-4 py-3 text-sm text-muted">About: <strong className="text-fg">{product.brand} {product.name}</strong> · Size {product.size} · {product.sku}</p>}
        {state === "sent" ? (
          <div role="status" className="mt-6 rounded-3xl bg-success-soft p-8 text-success">
            <CheckCircle2 className="mb-4 size-10" aria-hidden />
            <h3 className="text-3xl">Message sent — thank you!</h3>
            <p className="mt-2 text-sm">We&apos;ll reply to {form.email} soon. For anything urgent, WhatsApp is fastest.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Button variant="outline" onClick={() => { setState("idle"); setForm((f) => ({ ...f, message: "" })); }}>Send another</Button><Button href="/shop" variant="ghost">Keep browsing</Button></div>
            <p className="mt-4 text-xs opacity-80">Demo store: messages are saved in this browser only. Connect your backend in <code>lib/adapters/forms.ts</code>.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="relative mt-6 space-y-5">
            <Honeypot />
            {errors.form && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">{errors.form}</p>}
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Name" required autoComplete="name" value={form.name} maxLength={80} onChange={(e) => set("name", e.target.value)} error={errors.name} />
              <TextField label="Email" required type="email" inputMode="email" autoComplete="email" value={form.email} maxLength={120} onChange={(e) => set("email", e.target.value)} error={errors.email} />
              <TextField label="Phone (optional)" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} maxLength={20} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
              <SelectField label="Subject" value={form.subject} onChange={(e) => set("subject", e.target.value)}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</SelectField>
            </div>
            <TextAreaField label="Message" required rows={6} value={form.message} maxLength={2000} onChange={(e) => set("message", e.target.value)} error={errors.message} />
            <Button type="submit" size="lg" loading={state === "loading"} arrow>Send message</Button>
          </form>
        )}
      </div>

      <aside className="space-y-8" aria-label="Contact details">
        <a href={wa} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-3xl bg-[#1f9d55] p-6 text-white transition hover:-translate-y-0.5 hover:shadow-lift">
          <MessageCircle className="size-9 shrink-0" aria-hidden />
          <div><p className="text-lg font-bold">Chat on WhatsApp</p><p className="text-sm opacity-90">{c.whatsappDisplay} · fastest replies</p></div>
        </a>
        <ul className="space-y-5 text-sm">
          <li className="flex gap-4"><Mail className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /><div><p className="font-semibold">Email</p><a href={`mailto:${c.email}`} className="text-muted underline-offset-4 hover:underline">{c.email}</a></div></li>
          <li className="flex gap-4"><Phone className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /><div><p className="font-semibold">Phone</p><a href={`tel:${c.phone.replace(/\s/g, "")}`} className="text-muted underline-offset-4 hover:underline">{c.phone}</a></div></li>
          <li className="flex gap-4"><MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /><div><p className="font-semibold">Studio</p><p className="text-muted">{c.address.map((l) => <span key={l} className="block">{l}</span>)}</p></div></li>
          <li className="flex gap-4"><Clock className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /><div><p className="font-semibold">Hours</p>{c.hours.map((h) => <p key={h.days} className="text-muted">{h.days}: {h.time}</p>)}</div></li>
        </ul>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">Follow</p>
          <ul className="flex gap-2">{socials.map((s) => <li key={s.label}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} ${s.handle}`} className="grid size-12 place-items-center rounded-full border border-line-strong transition hover:bg-fg hover:text-bg"><s.icon className="size-5" aria-hidden /></a></li>)}</ul>
        </div>
        <div className="overflow-hidden rounded-3xl border border-line bg-soft">
          {c.mapEmbedUrl ? (
            <iframe title="Studio location" src={c.mapEmbedUrl} className="h-64 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <div className="relative grid h-56 place-items-center overflow-hidden" role="img" aria-label="Map placeholder">
              <svg aria-hidden viewBox="0 0 400 220" className="absolute inset-0 size-full text-line-strong" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="currentColor" strokeWidth="2"><path d="M-10 60 C80 40 140 120 230 90 S360 60 420 100" /><path d="M-10 150 C90 170 150 110 240 140 S360 200 420 160" /><path d="M120 -10 L150 230 M270 -10 L250 230" /></g></svg>
              <div className="relative text-center"><MapPin className="mx-auto size-8 text-accent" aria-hidden /><p className="mt-2 text-sm font-semibold">Map coming soon</p><p className="text-xs text-muted">Add your Google Maps embed URL in config</p></div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
