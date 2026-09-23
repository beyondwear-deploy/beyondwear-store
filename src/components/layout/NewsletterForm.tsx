"use client";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Honeypot, clean } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { isEmail } from "@/lib/adapters/auth";
import { subscribeNewsletter } from "@/lib/adapters/forms";

export function NewsletterForm({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("company_website")) return; // honeypot
    const v = clean(email, 120);
    if (!isEmail(v)) { setError("Please enter a valid email address."); setState("error"); return; }
    setError(""); setState("loading");
    const r = await subscribeNewsletter(v);
    if (!r.ok) { setError(r.error); setState("error"); return; }
    setState(r.duplicate ? "duplicate" : "success"); setEmail("");
  };

  if (state === "success" || state === "duplicate")
    return (
      <div role="status" className="flex items-center gap-3 rounded-2xl bg-success-soft px-5 py-4 text-success">
        <CheckCircle2 className="size-6 shrink-0" aria-hidden />
        <p className="text-sm font-semibold">{state === "duplicate" ? "You're already on the list — thank you!" : "You're in. Watch your inbox for the next drop."}</p>
      </div>
    );
  return (
    <form onSubmit={submit} noValidate className="relative">
      <Honeypot />
      <label htmlFor="nl-email" className="sr-only">Email address</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input id="nl-email" type="email" inputMode="email" autoComplete="email" value={email} maxLength={120}
          onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
          aria-invalid={state === "error"} aria-describedby={state === "error" ? "nl-err" : undefined} placeholder="Email address"
          className={`h-14 min-w-0 flex-1 rounded-full border px-6 text-sm outline-none transition placeholder:text-subtle focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_30%,transparent)] aria-[invalid=true]:border-danger ${tone === "dark" ? "border-white/25 bg-white/10 text-white placeholder:text-white/50 focus:border-white" : "border-line-strong bg-elev focus:border-fg"}`} />
        <Button type="submit" size="lg" variant={tone === "dark" ? "accent" : "primary"} loading={state === "loading"} arrow>Join the list</Button>
      </div>
      {state === "error" && <p id="nl-err" role="alert" className="mt-3 pl-4 text-xs font-medium text-danger">{error}</p>}
      <p className="mt-3 pl-4 text-xs opacity-60">No spam. Unsubscribe any time.</p>
    </form>
  );
}
